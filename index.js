var rp = require('request-promise');
var querystring = require('querystring');
var builder = require('xmlbuilder');
var convert = require('xml-js');

var Endicia = module.exports = function(config) {
    var required_keys = ["token", "requester_id", "server"];
    this.ensure_required_keys_exist(config, required_keys);
    
    this.config = config;
    console.log(config);
};

Endicia.prototype = {
    
    static_request_parameters : {
        token : {
            uri_path : "ChangePassPhraseXML",
            data_key : "changePassPhraseRequestXML",
        },
        rates : {
            uri_path : "CalculatePostageRatesXML",
            data_key : "PostageRatesRequestXML",
        },
    },
    
    
    
    
    promise_to_create_live_account : function(request){
        //GetUserSignup  
    },
    
    promise_new_token : function(request){
        /*
            Note - this function is expected to be accessed with
            Endicia.prototype.promise_new_token({temp_pass:"", new_pass:"", account_id:"", requester_id:""})
            
            This is because this function is only expected to be run once - to configure this users account
            This function print out the response from endicia - containing your new token.
        */
        var required_keys = ["server", "temp_pass", "new_pass", "account_id", "requester_id"];
        this.ensure_required_keys_exist(request, required_keys);
        
        /*
            <?xml version="1.0" encoding="utf-8"?>
            <ChangePassPhraseRequest TokenRequested="false">
                <RequesterID>lxxx</RequesterID>
                <RequestID>1</RequestID>
                <CertifiedIntermediary>
                    <AccountID>25xxxxx</AccountID>
                    <PassPhrase>your temporary Pass Phrase</PassPhrase>
                </CertifiedIntermediary>
                <NewPassPhrase>your new Pass Phrase</NewPassPhrase>
            </ChangePassPhraseRequest>
        */
        
        var request_xml = builder.create({
            ChangePassPhraseRequest : {
                "@TokenRequested" : "true",
                RequesterID : request.requester_id,
                RequestID : 1,
                CertifiedIntermediary : {
                    AccountID : request.account_id,
                    PassPhrase : request.temp_pass,
                },
                NewPassPhrase : request.new_pass,
            }
        })
        //console.log(request_xml.end({ pretty: true}));
        
        var promise_request = this.promise_to_send_request("token", request_xml, request.server)
            .then((result)=>{
                console.log(result);
            }) 
        
    },
    
    promise_to_credit_account : function(){
        /*
        Run the RecreditRequest API Method:
        <RecreditRequest>
        <RequesterID>lxxx</RequesterID>
        <RequestID>2</RequestID>
        <CertifiedIntermediary>
        <AccountID>25xxxxx</AccountID>
        <PassPhrase>your new Pass Phrase</PassPhrase>
        </CertifiedIntermediary>
        <RecreditAmount>500</RecreditAmount>
        </RecreditRequest>
        */
    },

    promise_rates : function(request){
        var required_keys = ["domestic_or_international", "weight_in_oz", "length", "width", "height", "from_zip", "to_zip"];
        
        this.ensure_required_keys_exist(request, required_keys);
        /*
<?xml version="1.0" encoding="utf-8"?>
<PostageRatesRequest>
  <RequesterID>string</RequesterID>
  <CertifiedIntermediary>
    <AccountID>string</AccountID>
    <PassPhrase>string</PassPhrase>
    <Token>string</Token>
  </CertifiedIntermediary>
  <MailClass>string</MailClass>
  <WeightOz>double</WeightOz>
  <MailpieceShape>string</MailpieceShape>
  <Machinable>string</Machinable>
  <Services DeliveryConfirmation="string" InsuredMail="string"/>
  <FromPostalCode>string</FromPostalCode>
  <ToPostalCode>string</ToPostalCode>
</PostageRatesRequest>
        */
        
        if(["Domestic", "International"].indexOf(request.domestic_or_international) == -1){
            console.error("Endicia.rates() requires the domestic_or_international attribute to be either `Domestic` or `International`");
            return false;
        };
        
        var request_xml = builder.create({
            PostageRatesRequest : {
                RequesterID : this.config.requester_id,
                CertifiedIntermediary : {
                    Token : this.config.token,
                },
                MailClass : request.domestic_or_international,
                WeightOz : request.weight_in_oz,
                MailpieceDimensions : {
                    Length : request.length, // note - "you'll get best rates if length is the longest dimension"
                    Width : request.width,
                    Height : request.height, 
                },
                FromPostalCode: request.from_zip,
                ToPostalCode : request.to_zip,
            }
        })
        
        var promise_request = this.promise_to_send_request("rates", request_xml, request.server)
            .then((result)=>{
                // parse resulting json into rates object
                
                var postage_options = result.PostageRatesResponse.PostagePrice;
                
                var rates = [];
                for(var i = 0; i < postage_options.length; i++){
                    let this_option = postage_options[i];
                    let this_rate = {
                        price : this_option._attributes.TotalAmount,
                        class : this_option.MailClass._text,
                        service : this_option.Postage.MailService._text,
                        pricing : this_option.Postage.Pricing._text,
                    } 
                    rates.push(this_rate);
                }
                
                return rates;
            }) 
        
        return promise_request;
        
    },
    
    ensure_required_keys_exist : function(request, required_keys){
        //var required_keys = ["domestic_or_international", "weight_in_oz", "length", "width", "height", "from_zip", "to_zip"],
        for(var i = 0; i < required_keys.length; i++){
            if(!request.hasOwnProperty(required_keys[i])){
                throw "Error : Endicia interface requires " + required_keys[i] + " to be present in the Endicia.rates() request object";
            }
        }
    },
    
    
    
    
    promise_to_send_request: function(identifier, xml, request_server){
        var uri_path = this.static_request_parameters[identifier].uri_path;
        var data_key = this.static_request_parameters[identifier].data_key;
        
        var request_data = {};
        console.log(xml.end({pretty:true}))
        request_data[data_key] = xml.dec('1.0', 'utf-8').end(); // adds the declaration and converts object to string
        var body_data = querystring.stringify(request_data);
        console.log(body_data);
        
        if((this.config && this.config.server)){
            var server = this.config.server;
        } else if(request_server){
            var server = request_server;
        } else {
            throw 'ENDICIA INTERFACE ERROR : not configured and server not passed.';
        }
        
        var options = {
            url: server+"/"+uri_path,
            body: body_data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };
        
        return rp.post(options)
            .then((result)=>{
                return JSON.parse(convert.xml2json(result, {compact: true, spaces: 4}));
            })
    },
    
}
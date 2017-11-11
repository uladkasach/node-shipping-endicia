### Intro

This repository is under development. This readme has a cluster of relevant information that needs to be refined.




### Example Usage

#### `endicia.promise_rates`:

```

    var endicia_config = require(process.env.root+'/config/endicia.json')["sandbox"];
    var endicia_interface = require('/shipping-endicia');
    var endicia =  new endicia_interface({
        server : endicia_config.server,
        requester_id : endicia_config.requester_id,
        account_id : endicia_config.account_id,
        token : endicia_config.token,
    });


    var request_object = {
        domestic_or_international : "Domestic",
        weight_in_oz : parseFloat(query.Parcel.Weight),
        length : query.Parcel.Dim1,
        width : query.Parcel.Dim2,
        height : query.Parcel.Dim3,
        from_zip : query.ReturnAddress.Zipcode,
        to_zip : query.DestinationAddress.Zipcode,
    }
    var promise_rates = endicia.promise_rates(request_object);


```


### Setup Information
lxxx is the sandbox  "RequesterID" for all sandbox accounts


Go to http://account.elstestserver.endicia.com/partner?id=lxxx (lxxx is the sandbox
"RequesterID" for all sandbox accounts) and create an ELS Sandbox account.
- make sure you use VISA 41111111111111 as the credit card
- Read endicia's documentation on creating an API account

After creating a sandbox account through their web interface, update your temp passphrase and generate your token with
```
Endicia.prototype.promise_new_token({...})
```
This will be run one time and it is critical that you save the token as you will need it to configure the usable Endicia interface module and to make calls to Endicia's api.



XML can be tested at https://elstestserver.endicia.com/LabelService/EwsLabelService.asmx

https://elstestserver.endicia.com/LabelService/EwsLabelService.asmx



Note - you wont actually get a token as a varriable. Check your console and grab it manually.
```
    var request_data = {
        "server" : endicia_config.server,
        "requester_id" : endicia_config.requester_id,
        "account_id" : endicia_config.account_id,
        "temp_pass" : "pass",
        "new_pass" : "newpass",
    }
    var promise_token = endicia_interface.prototype.promise_new_token(request_data);
```

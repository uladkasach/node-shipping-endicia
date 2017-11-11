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
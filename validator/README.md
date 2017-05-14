```JavaScript
let myValidator = new Validator({
    el: 'emailForm',
    autoFocus: true,
    fields: [{
        name: 'first_name',
        display: 'Please enter your first name',
        rules: 'required',
    }, {
        name: 'last_name',
        display: 'Please enter your last name',
        rules: 'required',
    }, {
        name: 'email',
        rules: 'required|email',
        display: 'Please enter a valid email address'
    }, {
        name: 'reference_number',
        display: 'place enter a valid reference number',
        rules: 'maxLength(12)'
    }, {
        name: 'subject',
        display: 'Please enter the subject.',
        rules: 'required'
    }, {
        name: 'question',
        display: 'Please tell us what we can help you with.',
        rules: 'required',
        needValidate() {
        	return true;
        }
    }],
    callbackItem: instance=> {
        console.log(instance);
    }
});

myValidator.validate().then(instance=> {
    console.log(instance);
});
```
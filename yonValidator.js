/**
 * Created by ahmad on 8/6/16.
 */
/**
 *
 * @type {{inputs: Array, addInput: validationgProtoType.addInput, check: validationgProtoType.check}}
 */

function toEnglishDigits(str) {
    var charCodeZero = '۰'.charCodeAt(0);
    return parseInt(str.replace(/[۰-۹]/g, function (w) {
        return w.charCodeAt(0) - charCodeZero;
    }));
};

function getValidatorPrototype() {
    return {
        inputs: new Array(),
        formId: String(''),
        setFormId: function (foId) {
            this.__proto__.formId = foId;
        },
        getId: function (parentId, childId) {
            return '#' + parentId + ' #' + childId;
        },
        addInput: function (inputId, rules) {
            this.inputs.push({id: inputId, rules: rules})
        },
        resetForm: function () {
            var that = this;

            this.inputs.forEach(function (input, index, array) {
                that.clean(input.id);
                $(that.getId(that.formId, input.id)).val('');
            })
        },
        getContainer: function (inputId) {
            var container = $(this.getId(this.formId, inputId + '-container'));
            if (!container.length) {
                $(this.getId(this.formId, inputId)).wrap('<div id="' + inputId + '-container"></div>');
                container = $(this.getId(this.formId, inputId + '-container'));
            }

            return container;
        },
        clean: function (inputId) {
            var that = this;
            that.getContainer(inputId).removeClass('has-error');
            $(this.getId(this.formId, inputId + '-error')).remove();
        },
        addError: function (inputId, errorList) {
            var container = this.getContainer(inputId);
            container.addClass('has-error');

            container.append('');
            var errorElement = '<ul>';
            errorList.forEach(function (error, index, array) {
                errorElement += ('<li>' + error + '</li>');
            });
            errorElement += ('</ul>');
            container.append('<span class="help-block" id="' + inputId + '-error">' + errorElement + '</span>')
        },
        check: function () {
            var that = this;

            var isFormValid = true;
            this.inputs.forEach(function (input, index, array) {
                var isInputValid = true;
                var errors = [];

                var fieldValue = $(that.getId(that.formId, input.id)).val();
                that.clean(input.id);

                input.rules.forEach(function (rule, index, array) {
                    var params = [fieldValue];
                    if (rule.parameters) {
                        params = params.concat(rule.parameters);
                    }

                    var result = rule.name.apply(null, params);
                    if (!result.isValid) {
                        isInputValid = false;
                        errors.push(result.msg);
                    }
                });

                if (!isInputValid) {
                    isFormValid = false;
                    that.addError(input.id, errors);
                }

            });

            return isFormValid;
        }
    };
}


var rules = {
    countCharValidator: function () {
        var value = arguments[0] + '';
        var n = arguments[1];

        return {isValid: value.length == n, msg: 'طول ورودی باید ' + n + ' کارکتر باشد.'};
    },

    emptyValidator: function () {
        var value = arguments[0];
        return {isValid: value != "", msg: 'ورودی نباید خالی باشد.'};
    },

    justNumericValidator: function () {
        var value = arguments[0];

        var con1 = !(/[^\u0030-\u0039]/g.test(value));
        var con2 = !(/[^\u06F0-\u06F9]/g.test(value));
        return {isValid: con1 || con2, msg: 'ورودی باید عددی باشد.'};
    },

    betweenCharacterCountValidator: function () {
        var value = arguments[0] + '';
        var from = arguments[1];
        var to = arguments[2];

        return {
            isValid: value.length >= from && value.length <= to,
            msg: 'طول ورودی باید بین ' + from + ' و ' + to + ' باشد.'
        }
    },

    biggerThan: function () {
        var value = toEnglishDigits(arguments[0] + '');
        var param = arguments[1];

        return {
            isValid: value > param,
            msg: 'ورودی باید بیشتر از ' + param + ' باشد.'
        }
    }
};

function makeRule(name, parameters) {
    return {name: name, parameters: parameters};
}

function getValidator(formId) {
    var val = Object.create(getValidatorPrototype());
    val.setFormId(formId);

    return val;
}
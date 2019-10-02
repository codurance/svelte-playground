var cf7signature_resized = 0; // for compatibility with contact-form-7-signature-addon

var wpcf7cf_timeout;

var wpcf7cf_show_animation = { "height": "show", "marginTop": "show", "marginBottom": "show", "paddingTop": "show", "paddingBottom": "show" };
var wpcf7cf_hide_animation = { "height": "hide", "marginTop": "hide", "marginBottom": "hide", "paddingTop": "hide", "paddingBottom": "hide" };

var wpcf7cf_show_step_animation = { "width": "show", "marginLeft": "show", "marginRight": "show", "paddingRight": "show", "paddingLeft": "show" };
var wpcf7cf_hide_step_animation = { "width": "hide", "marginLeft": "hide", "marginRight": "hide", "paddingRight": "hide", "paddingLeft": "hide" };

var wpcf7cf_change_events = 'input.wpcf7cf paste.wpcf7cf change.wpcf7cf click.wpcf7cf propertychange.wpcf7cf';

var wpcf7cf_forms = [];

function Wpcf7cfForm($form) {

    var options_element = $form.find('input[name="_wpcf7cf_options"]').eq(0);
    if (!options_element.length || !options_element.val()) {
        // doesn't look like a CF7 form created with conditional fields plugin enabled.
        return false;
    }

    var form = this;

    var form_options = JSON.parse(options_element.val());

    form.$form = $form;
    form.$hidden_group_fields = $form.find('[name="_wpcf7cf_hidden_group_fields"]');
    form.$hidden_groups = $form.find('[name="_wpcf7cf_hidden_groups"]');
    form.$visible_groups = $form.find('[name="_wpcf7cf_visible_groups"]');
    form.$repeaters = $form.find('[name="_wpcf7cf_repeaters"]');

    form.unit_tag = $form.closest('.wpcf7').attr('id');
    form.conditions = form_options['conditions'];
    form.settings = form_options['settings'];

    form.$groups = jQuery(); // empty jQuery set
    form.repeaters = [];
    form.multistep = null;
    form.fields = [];

    form.settings.animation_intime = parseInt(form.settings.animation_intime);
    form.settings.animation_outtime = parseInt(form.settings.animation_outtime);

    if (form.settings.animation === 'no') {
        form.settings.animation_intime = 0;
        form.settings.animation_outtime = 0;
    }

    form.updateGroups();
    form.updateEventListeners();
    form.displayFields();

    // bring form in initial state if the reset event is fired on it.
    form.$form.on('reset', form, function(e) {
        var form = e.data;
        setTimeout(function(){
            form.displayFields();
        },200);
    });

    //removed pro functions

}
Wpcf7cfForm.prototype.displayFields = function() {

    var form = this;

    var unit_tag = this.unit_tag;
    var wpcf7cf_conditions = this.conditions;
    var wpcf7cf_settings = this.settings;

    //for compatibility with contact-form-7-signature-addon
    if (cf7signature_resized === 0 && typeof signatures !== 'undefined' && signatures.constructor === Array && signatures.length > 0 ) {
        for (var i = 0; i < signatures.length; i++) {
            if (signatures[i].canvas.width === 0) {

                var $sig_canvas = jQuery(".wpcf7-form-control-signature-body>canvas");
                var $sig_wrap = jQuery(".wpcf7-form-control-signature-wrap");
                $sig_canvas.eq(i).attr('width',  $sig_wrap.width());
                $sig_canvas.eq(i).attr('height', $sig_wrap.height());

                cf7signature_resized = 1;
            }
        }
    }

    form.$groups.addClass('wpcf7cf-hidden');

    for (var i=0; i < wpcf7cf_conditions.length; i++) {

        var condition = wpcf7cf_conditions[i];

        // compatibility with conditional forms created with older versions of the plugin ( < 1.4 )
        if (!('and_rules' in condition)) {
            condition.and_rules = [{'if_field':condition.if_field,'if_value':condition.if_value,'operator':condition.operator}];
        }

        var show_group = wpcf7cf.should_group_be_shown(condition, form.$form);

        if (show_group) {
            jQuery('[data-id='+condition.then_field+']',form.$form).eq(0).removeClass('wpcf7cf-hidden');
        }
    }

    var animation_intime = wpcf7cf_settings.animation_intime;
    var animation_outtime = wpcf7cf_settings.animation_outtime;

    form.$groups.each(function (index) {
        $group = jQuery(this);
        if ($group.is(':animated')) $group.finish(); // stop any current animations on the group
        if ($group.css('display') === 'none' && !$group.hasClass('wpcf7cf-hidden')) {
            if ($group.prop('tagName') === 'SPAN') {
                $group.show().trigger('wpcf7cf_show_group');
            } else {
                $group.animate(wpcf7cf_show_animation, animation_intime).trigger('wpcf7cf_show_group'); // show
            }
        } else if ($group.css('display') !== 'none' && $group.hasClass('wpcf7cf-hidden')) {

            if ($group.attr('data-clear_on_hide') !== undefined) {
                $inputs = jQuery(':input', $group).not(':button, :submit, :reset, :hidden');
                $inputs.prop('checked', false).prop('selected', false).prop('selectedIndex', 0);
                $inputs.not('[type=checkbox],[type=radio],select').val('');
                $inputs.change();
                //display_fields();
            }

            if ($group.prop('tagName') === 'SPAN') {
                $group.hide().trigger('wpcf7cf_hide_group');
            } else {
                $group.animate(wpcf7cf_hide_animation, animation_outtime).trigger('wpcf7cf_hide_group'); // hide
            }

        }
    });

    form.updateHiddenFields();
};
Wpcf7cfForm.prototype.updateHiddenFields = function() {

    var form = this;

    var hidden_fields = [];
    var hidden_groups = [];
    var visible_groups = [];

    form.$groups.each(function () {
        var $this = jQuery(this);
        if ($this.hasClass('wpcf7cf-hidden')) {
            hidden_groups.push($this.data('id'));
            $this.find('input,select,textarea').each(function () {
                hidden_fields.push(jQuery(this).attr('name'));
            });
        } else {
            visible_groups.push($this.data('id'));
        }
    });

    form.hidden_fields = hidden_fields;
    form.hidden_groups = hidden_groups;
    form.visible_groups = visible_groups;

    form.$hidden_group_fields.val(JSON.stringify(hidden_fields));
    form.$hidden_groups.val(JSON.stringify(hidden_groups));
    form.$visible_groups.val(JSON.stringify(visible_groups));

    return true;
};
Wpcf7cfForm.prototype.updateGroups = function() {
    var form = this;
    form.$groups = form.$form.find('[data-class="wpcf7cf_group"]');

    form.$subgroups = form.$form.find('.wpcf7cf_repeater_sub [data-class="wpcf7cf_group"]');

    // var sub_conditions = [];

    form.$subgroups.each(function() {
        $group = jQuery(this);
        var index = $group.data('repeater_index');
        var group_name_orig = $group.data('orig_id');

        form.conditions.forEach(function (condition) {
            if (condition.then_field !== group_name_orig) return;
            var and_rules = [];
            condition.and_rules.forEach(function(entry) {
                and_rules.push({if_field:entry.if_field+'__'+index, operator: entry.operator, if_value:entry.if_value});
            });
            form.conditions.push({
                then_field:condition.then_field+'__'+index,
                and_rules: and_rules
            });
        });
    });

};
Wpcf7cfForm.prototype.updateEventListeners = function() {

    var form = this;

    // monitor input changes, and call display_fields() if something has changed
    jQuery('input, select, textarea, button',form.$form).not('.wpcf7cf_add, .wpcf7cf_remove').off(wpcf7cf_change_events).on(wpcf7cf_change_events,form, function(e) {
        var form = e.data;
        clearTimeout(wpcf7cf_timeout);
        wpcf7cf_timeout = setTimeout(function() {
            form.displayFields();
        }, 100);
    });

    //removed pro functions
};

//removed pro functions

var wpcf7cf = {

    // keep this for backwards compatibility
    initForm : function($form) {
        wpcf7cf_forms.push(new Wpcf7cfForm($form));
    },

    should_group_be_shown : function(condition, $current_form) {

        var $ = jQuery;

        var show_group = true;

        for (var and_rule_i = 0; and_rule_i < condition.and_rules.length; and_rule_i++) {

            var condition_ok = false;

            var condition_and_rule = condition.and_rules[and_rule_i];

            var $field = jQuery('[name="' + condition_and_rule.if_field + '"], [name="' + condition_and_rule.if_field + '[]"], [data-original-name="' + condition_and_rule.if_field + '"], [data-original-name="' + condition_and_rule.if_field + '[]"]',$current_form);

            var if_val = condition_and_rule.if_value;
            var if_val_as_number = isFinite(parsedval=parseFloat(if_val)) ? parsedval:0;
            var operator = condition_and_rule.operator;
            var regex_patt = new RegExp(if_val, 'i');


            if ($field.length === 1) {

                // single field (tested with text field, single checkbox, select with single value (dropdown), select with multiple values)

                if ($field.is('select')) {

                    if (operator === 'not equals') {
                        condition_ok = true;
                    }

                    $field.find('option:selected').each(function () {
                        var $option = jQuery(this);
                        option_val = $option.val()
                        if (
                            operator === 'equals' && option_val === if_val ||
                            operator === 'equals (regex)' && regex_patt.test($option.val())
                        ) {
                            condition_ok = true;
                        } else if (
                            operator === 'not equals' && option_val === if_val ||
                            operator === 'not equals (regex)' && !regex_patt.test($option.val())
                        ) {
                            condition_ok = false;
                            return false; // break out of the loop
                        }
                    });

                    show_group = show_group && condition_ok;
                }

                var field_val = $field.val();
                var field_val_as_number = isFinite(parsedval=parseFloat(field_val)) ? parsedval:0;

                if ($field.attr('type') === 'checkbox') {
                    var field_is_checked = $field.is(':checked');
                    if (
                        operator === 'equals'             && field_is_checked && field_val === if_val ||
                        operator === 'not equals'         && !field_is_checked ||
                        operator === 'is empty'           && !field_is_checked ||
                        operator === 'not empty'          && field_is_checked ||
                        operator === '>'                  && field_is_checked && field_val_as_number > if_val_as_number ||
                        operator === '<'                  && field_is_checked && field_val_as_number < if_val_as_number ||
                        operator === '≥'                  && field_is_checked && field_val_as_number >= if_val_as_number ||
                        operator === '≤'                  && field_is_checked && field_val_as_number <= if_val_as_number ||
                        operator === 'equals (regex)'     && field_is_checked && regex_patt.test(field_val) ||
                        operator === 'not equals (regex)' && !field_is_checked

                    ) {
                        condition_ok = true;
                    }
                } else if (
                    operator === 'equals'             && field_val === if_val ||
                    operator === 'not equals'         && field_val !== if_val ||
                    operator === 'equals (regex)'     && regex_patt.test(field_val) ||
                    operator === 'not equals (regex)' && !regex_patt.test(field_val) ||
                    operator === '>'                  && field_val_as_number > if_val_as_number ||
                    operator === '<'                  && field_val_as_number < if_val_as_number ||
                    operator === '≥'                  && field_val_as_number >= if_val_as_number ||
                    operator === '≤'                  && field_val_as_number <= if_val_as_number ||
                    operator === 'is empty'           && field_val === '' ||
                    operator === 'not empty'          && field_val !== '' ||
                    (
                        operator === 'function'
                        && typeof window[if_val] == 'function'
                        && window[if_val]($field)
                    )
                ) {
                    condition_ok = true;
                }


            } else if ($field.length > 1) {

                // multiple fields (tested with checkboxes, exclusive checkboxes, dropdown with multiple values)

                var all_values = [];
                var checked_values = [];
                $field.each(function () {
                    all_values.push(jQuery(this).val());
                    if (jQuery(this).is(':checked')) {
                        checked_values.push(jQuery(this).val());
                    }
                });

                var checked_value_index = jQuery.inArray(if_val, checked_values);
                var value_index = jQuery.inArray(if_val, all_values);

                if (
                    ( operator === 'is empty' && checked_values.length === 0 ) ||
                    ( operator === 'not empty' && checked_values.length > 0  )
                ) {
                    condition_ok = true;
                }


                for (var ind = 0; ind < checked_values.length; ind++) {
                    var checked_val = checked_values[ind];
                    var checked_val_as_number = isFinite(parsedval=parseFloat(checked_val)) ? parsedval:0;
                    if (
                        ( operator === 'equals'             && checked_val === if_val ) ||
                        ( operator === 'not equals'         && checked_val !== if_val ) ||
                        ( operator === 'equals (regex)'     && regex_patt.test(checked_val) ) ||
                        ( operator === 'not equals (regex)' && !regex_patt.test(checked_val) ) ||
                        ( operator === '>'                  && checked_val_as_number > if_val_as_number ) ||
                        ( operator === '<'                  && checked_val_as_number < if_val_as_number ) ||
                        ( operator === '≥'                  && checked_val_as_number >= if_val_as_number ) ||
                        ( operator === '≤'                  && checked_val_as_number <= if_val_as_number )
                    ) {
                        condition_ok = true;
                    }
                }
            }

            show_group = show_group && condition_ok;
        }

        return show_group;

    }

};


jQuery('.wpcf7-form').each(function(){
    wpcf7cf_forms.push(new Wpcf7cfForm(jQuery(this)));
});

// Call displayFields again on all forms
// Necessary in case some theme or plugin changed a form value by the time the entire page is fully loaded.
jQuery('document').ready(function() {
    wpcf7cf_forms.forEach(function(f){
        f.displayFields();
    });
});

// fix for exclusive checkboxes in IE (this will call the change-event again after all other checkboxes are unchecked, triggering the display_fields() function)
var old_wpcf7ExclusiveCheckbox = jQuery.fn.wpcf7ExclusiveCheckbox;
jQuery.fn.wpcf7ExclusiveCheckbox = function() {
    return this.find('input:checkbox').click(function() {
        var name = jQuery(this).attr('name');
        jQuery(this).closest('form').find('input:checkbox[name="' + name + '"]').not(this).prop('checked', false).eq(0).change();
    });
};


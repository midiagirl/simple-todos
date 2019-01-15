import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import {Tasks} from '../../api/tasks.js';

import '../task.js';
import './landing.html';

Template.Landing_page.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('tasks');
});

Template.Landing_page.helpers({
    tasks() {
        const instance = Template.instance();
        if (instance.state.get('hideCompleted')) {
            // If hide completed is checked, filter tasks
            return Tasks.find({
                checked: {
                    $ne: true
                }
            }, {
                sort: {
                    createdAt: -1
                }
            });
        }
        // Otherwise, return all of the tasks
        return Tasks.find({}, {
            sort: {
                createdAt: -1
            }
        });
    },
    incompleteCount() {
        return Tasks.find({checked: {$ne: true}}).count();
    },

});

Template.Landing_page.events({
    'submit .new-task': function (event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;

        // Insert a task into the collection
        Meteor.call('tasks.insert', text);

        // Clear form
        target.text.value = '';
    },
    'change .hide-completed input': function (event, instance) {
        instance.state.set('hideCompleted', event.target.checked);
    },
});
/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'chai';
import { Accounts } from 'meteor/accounts-base';

import { Tasks } from './tasks.js';

if (Meteor.isServer) {
  describe('Tasks', () => {
    describe('methods', () => {
      const username = 'amanda';
      let taskId, userId;

      before(() => {
        //create user if not already created
        const user = Meteor.users.findOne({username : username});
        if (!user) {
          userId = Accounts.createUser({
            'username' : username,
            'email' : 'amanda@gmail.com',
            'password' : '12345678',
          });
        } else {
          userId = user._id
        }
      });

      beforeEach(() => {
        Tasks.remove({});
        taskId = Tasks.insert({
          text: 'test task',
          createdAt: new Date(),
          owner: userId,
          username: 'tmeasday',
        });
      });

      // can delete task test
      it('can delete owned task', () => {
        // Find the internal implementation of the task method so we can
        // test it in isolation
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];

        // Set up a fake method invocation that looks like what the method expects
        const invocation = { userId };

        // Run the method with `this` set to the fake invocation
        deleteTask.apply(invocation, [taskId]);

        // Verify that the method does what we expected
        assert.equal(Tasks.find().count(), 0);
      });

      //cannot delete another user task
      it('cannot delete another user task', () => {
        // set task to private

        // generate random id representing another user
        const anotherUserId = Random.id();

        // fetch the internal implementation of the method
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];

        // set up a fake method invocation or fake userid object for method
        const fakeUserObject = { 'userId' : anotherUserId };

        // verify that exception is thrown. we expect an error to come up if user is trying to delete anothers task but to over throw the error meesage to check if the code actually works, we use assert.throws
        assert.throws (function() {
          deleteTask.apply(fakeUserObject, [taskId]);
        }, Meteor.Error, 'not-authorized');

        // verify that the task is not deleted
        assert.equal(Tasks.find().count(), 1);
      });

      

      // cannot delete another user private task test, will need to set task to private in tasks.js file first (just uncomment the task.remove code that was commented out and comment out the other code block)
      // it('cannot delete another user private task', () => {
      //   // set task to private
      //   Tasks.update(taskId, {$set: {private: true}});
      //
      //   // generate random id representing another user
      //   const anotherUserId = Random.id();
      //
      //   // fetch the internal implementation of the method
      //   const deleteTask = Meteor.server.method_handlers['tasks.remove'];
      //
      //   // set up a fake method invocation or fake userid object for method
      //   const fakeUserObject = { 'userId' : anotherUserId };
      //
      //   // verify that exception is thrown. we expect an error to come up if user is trying to delete anothers task but to over throw the error meesage to check if the code actually works, we use assert.throws
      //   assert.throws (function() {
      //   deleteTask.apply(fakeUserObject, [taskId]);
      //   }, Meteor.Error, 'not-authorized');
      //
      //   // verify that the task is not deleted
      //   assert.equal(Tasks.find().count(), 1);
      // });


      // // can delete another user public task test
      // it('can delete another user public task', () => {
      //   // set task to private
      //   // Tasks.update(taskId, {$set: {private: true}});
      //
      //   // generate random id representing another user
      //   const anotherUserId = Random.id();
      //
      //   // fetch the internal implementation of the method
      //   const deleteTask = Meteor.server.method_handlers['tasks.remove'];
      //
      //   // set up a fake method invocation or fake userid object for method
      //   const fakeUserObject = { 'userId' : anotherUserId };
      //
      //   // verify that exception is thrown. we expect an error to come up if user is trying to delete anothers task but to over throw the error meesage to check if the code actually works, we use assert.throws
      //   // assert.throws (function() {
      //   deleteTask.apply(fakeUserObject, [taskId]);
      //   // }, Meteor.Error, 'not-authorized');
      //
      //   // verify that the task is deleted
      //   assert.equal(Tasks.find().count(), 0);
      // });

      //can insert task tests
      it('can insert task', () => {

        //create task String
        const text = 'Hello!'

        // get insert task method
        const insertTask = Meteor.server.method_handlers['tasks.insert'];

        //create fake user object for test
        const fakeUserObject = { userId }

        //run test
        insertTask.apply(fakeUserObject, [text]);

        // Verify that the method does what we expected
        assert.equal(Tasks.find().count(), 2);
      });

      // cannot insert task if not logged in test
      it('cannot insert task if not logged in', () => {

        //create task String
        const text = 'Hello!'

        // generate random id representing another user
        const anotherUserId = {};

        // get insert task method
        const insertTask = Meteor.server.method_handlers['tasks.insert'];

        //create fake user object for test
        const fakeUserObject = { anotherUserId }

        // run test and verify that exception is thrown. we expect an error to come up if user is trying to create task when not logged in but to over throw the error meesage to check if the code actually works, we use assert.throws
        assert.throws (function() {
          insertTask.apply(fakeUserObject, [text]);
        }, Meteor.Error, 'not-authorized');

        // verify that the task is not created
        assert.equal(Tasks.find().count(), 1);
      });

      // can set checked test
      it('can set checked', () => {

        //create task String
        // const text = 'Hello!'

        // get set checked method
        const setChecked = Meteor.server.method_handlers['tasks.setChecked'];

        //create fake user object for test
        const fakeUserObject = { userId }

        //run test
        setChecked.apply(fakeUserObject, [taskId, true]);

        // Verify that the method does what we expected
        assert.equal(Tasks.find({checked : true}).count(), 1);
      });


      // cannot set another user task checked test
      it('cannot set another user private task checked', () => {
        // set task to private
        Tasks.update(taskId, {$set: {private: true}});

        // generate random id representing another user
        const anotherUserId = Random.id();

        // fetch the internal implementation of the method
        const setChecked = Meteor.server.method_handlers['tasks.setChecked'];

        // set up a fake method invocation or fake userid object for method
        const fakeUserObject = { 'userId' : anotherUserId };

        // verify that exception is thrown. we expect an error to come up if user is trying to set another users task checked but to over throw the error meesage to check if the code actually works, we use assert.throws
        assert.throws (function() {
          setChecked.apply(fakeUserObject, [taskId, true]);
        }, Meteor.Error, 'not-authorized');

        // verify that the task is not deleted
        assert.equal(Tasks.find({checked : true}).count(), 0);
      });


      //can set task private
      it('can set private', () => {

        // get set private method
        const setPrivate = Meteor.server.method_handlers['tasks.setPrivate'];

        //create fake user object for test
        const fakeUserObject = { userId }

        //run test
        setPrivate.apply(fakeUserObject, [taskId, true]);

        // Verify that the method does what we expected
        assert.equal(Tasks.find({private : true}).count(), 1);
      });


      // cannot set another user task private test
      it('cannot set another user task private', () => {
        // set task to private
        // Tasks.update(taskId, {$set: {private: true}});

        // generate random id representing another user
        const anotherUserId = Random.id();

        // fetch the internal implementation of the method
        const setPrivate = Meteor.server.method_handlers['tasks.setPrivate'];

        // set up a fake method invocation or fake userid object for method
        const fakeUserObject = { 'userId' : anotherUserId };

        // verify that exception is thrown. we expect an error to come up if user is trying to set another users task private but to over throw the error meesage to check if the code actually works, we use assert.throws
        assert.throws (function() {
          setPrivate.apply(fakeUserObject, [taskId, true]);
        }, Meteor.Error, 'not-authorized');

        // verify that the task is not private
        assert.equal(Tasks.find({checked : true}).count(), 0);
      });

    });
  });
}

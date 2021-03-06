window.isValidPassword = function(p) {
  if (p.length >= 6) {
    return true;
  } else {
    return false;
  }
}

var checkPassword = function(p1,p2) {
  if (!isValidPassword(p1) || !(p1===p2)) {
    return Template.instance().invalidPassword.set(true);
  } else {
    return Template.instance().invalidPassword.set(false);
  }
};

var createUser = function(user, template) {
  Accounts.createUser({
    email: user.email,
    password: user.password,
    username: user.username,
    profile : {
      "name" : user.name
      }
    }, function(err) {
      if (err) {
        template.signupError.set(err.reason || err.error);
      } else {
        Router.go('/');
     }});
  };

Template.signup_form.onCreated(function() {
  this.invalidPassword = new ReactiveVar(false);
  this.signupError = new ReactiveVar();
  this.emailError = new ReactiveVar();
  this.usernameError = new ReactiveVar();
  this.passwordError = new ReactiveVar();
});

Template.signup_form.helpers({
  tempUsername: function() {
    if (Meteor.user()) {
      return Meteor.user().tempUsername;
    }
    return;
  },
  emailUser: function() {  
   return Session.get('emailUser');
  },
  invalidPassword: function() {
    return Template.instance().invalidPassword.get();
  },
  signupError: function() {
    return Template.instance().signupError.get();
  },
  emailError: function () { 
    return Template.instance().emailError.get();
  },
  usernameError: function () { 
    return Template.instance().usernameError.get();
  },
  passwordError: function () { 
    return Template.instance().passwordError.get();
  }
});

Template.signup_form.events({
  'blur input#signup-email': function(e, t) {
    var val = $(e.currentTarget).val();
    if (!SimpleSchema.RegEx.Email.test(val) && val !== '') {
      t.emailError.set('Invalid e-mail address');
      return;
    }

    if (SimpleSchema.RegEx.Email.test(val) && val !== '') {
      t.emailError.set('');
      return;
    }
  },
  'blur input#signup-username': function(e, t) {
    var val = $("#signup-username").val();

    var usernameRegex = /^[a-zA-Z0-9-_]+$/;  // Only alphanumeric, -, and _

    if (!val.match(usernameRegex)) {
      t.usernameError.set('Invalid username')
      return;
    } else {
      t.usernameError.set('')
    }
  },
  'blur input#signup-password': function(e, t) {
    var p1 = $("#signup-password").val();

    if (p1 === '') {
      t.passwordError.set('');
      return;
    }

    if (!isValidPassword(p1)) {
      t.passwordError.set('Password too short')
      return;
    }
  },

  'keyup input#signup-password2': function(e, t) {
    var p1 = $("#signup-password").val();
    var p2 = $("#signup-password2").val();

    if (p1 !== p2) {
      t.passwordError.set('Passwords do not match')
      return;
    }

    if (p1 === p2) {
      t.passwordError.set('')
      return;
    }
  },
  'submit #signup-form': function (e, template) {
    e.preventDefault();

    var inputs = $('#signup-form').serializeArray();
    var userInfo = {};
    _.each(inputs, function (input) {
      key = input['name'];
      value = input['value'];
      userInfo[key] = value;
    });

    if (Meteor.user()) { // if just finishing signup and already created a user via twitter
      Meteor.call('updateInitialTwitterUserInfo', userInfo, function (err) {
        if (err) {
          template.signupError.set(err.reason || err.error);
        } else {
          Router.go('/');
        }
      });
    } else { // if email user
      checkPassword(userInfo.password, userInfo.password2);
      if (!template.invalidPassword.get()) {
        createUser(userInfo, template);
      }
    }
  }
});

'use strict';
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          msg: 'Email must be valid'
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [1,99], 
          msg: 'Invalid user name. Must be between 1 and 99 characters.'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [8,99],
          msg: 'Password must be at least 8 characters.'
        }
      }
    }
  }, {
    hooks: { //lifecycle hook; event handlers triggered
      beforeCreate: function(pendingUser, options) {
        if (pendingUser && pendingUser.password) {
          var hash = bcrypt.hashSync(pendingUser.password, 12);
          pendingUser.password = hash;
        }
      }
    }
  });
  user.associate = function(models) {
    // associations can be defined here; one user has many photos, posts etc;
  }; //every user has validPassword, compare input typed pwd w stored pwd
  user.prototype.validPassword = function(passwordTyped) { //funct declaration for user AUTHENTICATION
    return bcrypt.compareSync(passwordTyped, this.password);
  };
  user.prototype.toJSON = function() {
    var userData = this.get();
    delete userData.password;
    return userData;
  };
  return user;
};
define({ "api": [
  {
    "type": "get",
    "url": "http://localhost/cms/",
    "title": "Admin login",
    "version": "1.0.0",
    "name": "Login",
    "group": "Admin",
    "permission": [
      {
        "name": "root",
        "title": "RootUser Require root permission",
        "description": ""
      }
    ],
    "description": "<p>Admin login page</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "HTML",
            "optional": false,
            "field": "HTML",
            "description": "<p>Returns a Admin login Home</p>"
          }
        ]
      }
    },
    "filename": "routes/cms.js",
    "groupTitle": "Admin"
  },
  {
    "type": "get",
    "url": "http://localhost/users/",
    "title": "Get user home",
    "version": "1.0.0",
    "name": "Home",
    "group": "Home",
    "description": "<p>This route handle request for 'home' dir. but, nothing serve here.</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "JSON",
            "description": "<p>Returns a JSON Object</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example response:",
        "content": "\nHTTP/1.1 401 Unauthorized\n{\n     \"error\": \"Unauthorized\"\n}",
        "type": "JSON"
      }
    ],
    "filename": "routes/users.js",
    "groupTitle": "Home"
  },
  {
    "type": "get",
    "url": "http://localhost/",
    "title": "Home route",
    "version": "1.0.0",
    "name": "Home_Main",
    "group": "Home",
    "description": "<p>This route handle request for 'home' dir. but, nothing server here, redirect to '/cms' and available only for admins. Login require</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "HTML",
            "optional": false,
            "field": "HTML",
            "description": "<p>Returns a Login Page</p>"
          }
        ]
      }
    },
    "filename": "routes/home.js",
    "groupTitle": "Home"
  },
  {
    "type": "get",
    "url": "http://localhost/:nick?key={key}&request={command}",
    "title": "User commands",
    "version": "1.0.0",
    "name": "Commands",
    "group": "User",
    "description": "<p>Commands availables for users request.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "nick",
            "description": "<p>Get nickname</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "host",
            "description": "<p>Get hostame</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "date",
            "description": "<p>Get register date</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "all",
            "description": "<p>Get all info for this user</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Usage:",
        "content": "\nhttp://localhost/pepito?key=Aert87/&655!?&request=date\n\nHTTP/1.1 200 OK\n{\n     \"success\": \"Query OK\",\n     \"value\": 1245987548725\n}\n\n-- Apply same syntax for all commands",
        "type": "JSON"
      }
    ],
    "filename": "routes/users.js",
    "groupTitle": "User"
  },
  {
    "type": "delete",
    "url": "http://localhost/users/:nick?key={key}",
    "title": "Delete a users",
    "version": "1.0.0",
    "name": "Delete_User",
    "group": "User",
    "description": "<p>Delete a specified user by nick</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "key",
            "description": "<p>The auth token for this user</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "JSON",
            "description": "<p>Returns a JSON Object</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example response:",
        "content": "\nHTTP/1.1 200 OK\n{\n     \"success\": \"OK\"\n}",
        "type": "JSON"
      }
    ],
    "filename": "routes/users.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "http://localhost/users/:nick",
    "title": "Get info about a user",
    "version": "1.0.0",
    "name": "GetUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "key",
            "defaultValue": "null",
            "description": "<p>Token for this user</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "request",
            "defaultValue": "null",
            "description": "<p>Command</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request example",
          "content": "\nhttp://localhost/users/foo?key=bar&request=all",
          "type": "url"
        }
      ]
    },
    "description": "<p>This route handle request for returns info about a user</p>",
    "sampleRequest": [
      {
        "url": "http://localhost/users/foo?key=bar&request=all"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "JSON",
            "description": "<p>Returns a JSON Object</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example response:",
        "content": "\nHTTP/1.1 200 OK\n{\n     \"success\": \"Query OK\",\n     \"value\": request_data\n}",
        "type": "JSON"
      }
    ],
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>If auth token is failed.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "BadRequest",
            "description": "<p>If query is wrong</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotFound",
            "description": "<p>If this user not exists</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example response",
          "content": "\nHTTP/1.1 401 Unauthorized\n{\n     \"error\": \"Unauthorized\"\n}\nHTTP/1.1 400 Bad request\n{\n     \"error\": \"Bad request\"\n}\nHTTP/1.1 404 Not found\n{\n     \"error\": \"Not found\"\n}",
          "type": "JSON"
        }
      ]
    },
    "filename": "routes/users.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "http://localhost/register?nick={nick}&ip={ip}&password={pass}",
    "title": "Register a user",
    "version": "1.0.0",
    "name": "RegisterUser",
    "group": "User",
    "description": "<p>Register a user into database</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "nick",
            "defaultValue": "null",
            "description": "<p>nickname for this user</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "ip",
            "defaultValue": "null",
            "description": "<p>hostname for this user</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "defaultValue": "null",
            "description": "<p>password for this user</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "JSON",
            "description": "<p>Returns a JSON Object</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example:",
          "content": "\nHTTP/1.1 201 Created\n{\n     \"success\": \"Created\"\n}",
          "type": "JSON"
        }
      ]
    },
    "examples": [
      {
        "title": "Request example:",
        "content": "\nhttp://localhost/register?nick=foo&ip=127.0.0.1&password=bar&email=email",
        "type": "url"
      }
    ],
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "JSON",
            "optional": false,
            "field": "BadRequest",
            "description": "<p>If some params is not provide</p>"
          },
          {
            "group": "Error 4xx",
            "type": "JSON",
            "optional": false,
            "field": "Conflict",
            "description": "<p>If user already exists</p>"
          },
          {
            "group": "Error 4xx",
            "type": "JSON",
            "optional": false,
            "field": "InternalServerError",
            "description": "<p>If a error ocurred while registration process</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n     \"error\": \"Internal Server Error\"\n}",
          "type": "JSON"
        }
      ]
    },
    "filename": "routes/register.js",
    "groupTitle": "User"
  }
] });

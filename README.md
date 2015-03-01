# expose

Simple webhook service

## Install

```
git clone git@github.com:ruleb/expose.git expose
cd expose
npm install
node app.js
```

## Hooks

Hook configurations are stored in `/hooks.d`.  
They should contain a list hooks and have a filename that ends with `.json`.  

Every json file can contain multiple hooks.  
Common use case is one file per environment-app. 

## Hook definition

| field   | value                                                |
|---------|------------------------------------------------------|
| url_key | the route at which the webhook will be called        |
| when    | a list of filters that should pass                   |
| tasks   | a list of tasks to be executed when the filters pass |


Example:

```
{
    "url_key": "production-deploy-api",
    "when": [
      {
        "filter": "github-webhook-valid",
        "secret": "webhook password"
      }
    ],
    "tasks": [
        {
            "dir": "/tmp",
            "exec": "echo 'hello deploy script'"
        }
    ]
}
```


### Filters

#### github-webhook-valid

Matches a signed github push POST-request, requires your webhook secret.

```
{
    "filter": "github-webhook-valid",
    "secret": "webhook password"
}
```

#### git-remote-status

Checks a local git repository with 1 fetch remote if the local version is identical to the remote.  

Values: `remote-different, remote-identical`

```
{
    "filter": "git-remote-status",
    "dir": "/path/to/local/repo",
    "value": "remote-different"
}
```

#### headers-match

Tests if a certain header exists with the right value.

```
{
    "filter": "header-match",
    "key": "Authorization",
    "value": "token"
}
```

### Tasks
Currently only shell tasks are called.

```
{
    "dir": "dir where command will be executed",
    "exec": "commands / shell script"
}
```

## Service config file

An optional service config can be created in the root directory called `config.json`

| field | value | default |
| ----- | ----- | ------- |
| port  | http port to listen | 20000 |
| route | root route, note the trailing slash | /hook/ |

```
{
  "port": 20000,
  "route": "/hook/"
}
```

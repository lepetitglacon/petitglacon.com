# Forgejo actions
This app is a POC / Tutorial to run [Forgero](https://forgejo.org/) [Actions](https://forgejo.org/docs/latest/admin/actions/) on a [Vue](https://vuejs.org/guide/scaling-up/testing) app, in [Docker](https://www.docker.com/), for Windows

## Prerequisite
* Docker Desktop
* [Go](https://go.dev/)
* A server to run Forgejo on
* A testing server (will be your own machine in this tutorial)

## Network Infrastructure
![img.png](img.png)

## Install Forgejo
1. Pull the docker image
   `docker pull codeberg.org/forgejo/forgejo:8.0.3`
2. Create a container with the image and set the port to `3000`
3. Run the container and go to `localhost:3000`
4. Create the instance, set admin user settings
5. Create an organization
6. Create a repository
7. Activate Actions

## Install the Forgejo Action Runner
## Installation
These steps should be done on your testing server (a separated one from your Forgejo server)
* clone the runner repository `https://code.forgejo.org/forgejo/runner`
* [optional] either stay on `main` branch or checkout the last tag `$ git checkout v3.5.1`
* run `$ cd runner`
* run `$ go build` _for windows user Go should be installed on your machine_. _For linux users you can directly start the .sh file in the tag release_
### Register the runner
Connect the runner to the forgejo server
* In the same cmd run `$ ./act_runner register`
* Create a new runner, get the token from http://localhost:3000/user/settings/actions/runners
* Forgejo URL should be your local IP _ex: http://192.168.1.31:3000/_ (your computer). `localhost:3000` will not work because the test docker created won't have access to your local machine
* Go to http://localhost:3000/user/settings/actions/runners to check if your runner has been registered and is idling

### Start the runner
The runner will pull tasks from the Forgejo server and execute them
* run `$ ./act_runner daemon`

## Setup actions for your repository
### Create actions jobs
In your git repository, create a folder `.forgejo/workflow/`<br>
Inside create a file `test_actions.yaml`
```yaml
# your_repo/.forgejo/workflows/test_actions.yaml

name: Forgejo Action CI
on:
  push:
    branches: [ main ]
    
jobs:
  unit-tests:
    runs-on: docker
    steps:
      - name: Setup node
        uses: actions/setup-node@v4
      - name: Check out repository code
        uses: actions/checkout@v4
      - name: npm install
        run: 'npm ci'
      - name: Unit test
        run: 'npm run test:unit'

  cypress-e2e:
    runs-on: docker
    needs: unit-tests
    container:
      image: cypress/base
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Cypress run
        uses: cypress-io/github-action@v6
        with:
          build: npm run build
          start: npm run preview
          browser: electron # or chrome, depends on your container image
```

## See the results
* Commit some changes and push to the git server
* Go to http://localhost:3000/{yourOrga}/{your_repo}/actions
* See the tests running
* Taaadaaa all tests are green !
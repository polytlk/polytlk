    #! /bin/bash
    echo "START PACKER SETUP SCRIPT!!!!"

    apt-get update 
    apt-get install -y unzip jq
    curl -fsSL https://fnm.vercel.app/install | bash
    source /.bashrc
    fnm install 18
    npm i -g pnpm
    mkdir actions-runner && cd actions-runner
    curl -o actions-runner-linux-x64-2.308.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.308.0/actions-runner-linux-x64-2.308.0.tar.gz
    tar xzf ./actions-runner-linux-x64-2.308.0.tar.gz

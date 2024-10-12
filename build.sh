#!/bin/bash

# Install Python
curl -L https://github.com/pyenv/pyenv-installer/raw/master/bin/pyenv-installer | bash
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
pyenv install $PYTHON_VERSION
pyenv global $PYTHON_VERSION

# Install pip
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py

# Install dependencies
pip install -r requirements.txt
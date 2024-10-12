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

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm ci

# Install Tailwind CSS and its dependencies
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

# Generate Tailwind CSS configuration if it doesn't exist
if [ ! -f tailwind.config.js ] && [ ! -f tailwind.config.ts ]; then
  npx tailwindcss init -p
fi

# Create a CSS file for Tailwind if it doesn't exist
if [ ! -f styles/globals.css ]; then
  mkdir -p styles
  echo "@tailwind base;
@tailwind components;
@tailwind utilities;" > styles/globals.css
fi

# Build Tailwind CSS
npx tailwindcss -i styles/globals.css -o styles/output.css

# Ensure Tailwind CSS is available in the Next.js build process
export NODE_PATH=$(npm root -g)

# Link Tailwind CSS to the project
npm link tailwindcss

# Build Next.js app
npm run build
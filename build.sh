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

# Install TypeScript and ESLint
npm install --save-dev typescript@latest @types/react@latest @types/node@latest eslint@latest

# Verify TypeScript and ESLint installation
npx tsc --version
npx eslint --version

# Install additional dependencies
npm install uuid

# Install Tailwind CSS and its dependencies
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

# Ensure autoprefixer is available
npm install -g autoprefixer

# Link autoprefixer to the project
npm link autoprefixer

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
export NODE_PATH=$(npm root -g):$(npm root)

# Link Tailwind CSS to the project
npm link tailwindcss

# Create a basic tsconfig.json if it doesn't exist
if [ ! -f tsconfig.json ]; then
  echo '{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}' > tsconfig.json
fi

# Build Next.js app with TypeScript checking and ESLint
npm run build || npm run build -- --debug
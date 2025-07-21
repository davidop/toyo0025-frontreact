# Usar imagen base de Node.js con herramientas de desarrollo
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:18-bullseye

# El usuario vscode ya existe en esta imagen base
USER root

# Instalar herramientas adicionales básicas
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    zip \
    jq \
    tree \
    vim \
    nano \
    && rm -rf /var/lib/apt/lists/*

# Instalar herramientas globales de Node.js
RUN npm install -g \
    serve \
    http-server \
    nodemon \
    concurrently \
    cross-env

# Configurar Git globalmente
RUN git config --global init.defaultBranch main \
    && git config --global pull.rebase false

# Crear workspace y configurar permisos
RUN mkdir -p /workspace && \
    chown -R node:node /workspace

# Cambiar al usuario node (que existe en la imagen base)
USER node
WORKDIR /workspace

# Configurar bash para el usuario
RUN echo 'export PS1="\[\033[01;32m\]\u@toyota-dev\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ "' >> ~/.bashrc && \
    echo 'alias ll="ls -alF"' >> ~/.bashrc && \
    echo 'alias la="ls -A"' >> ~/.bashrc && \
    echo 'alias l="ls -CF"' >> ~/.bashrc

# Exponer puertos
EXPOSE 5173 3000 4173

CMD ["bash"]

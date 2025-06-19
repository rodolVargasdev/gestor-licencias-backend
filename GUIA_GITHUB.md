# 🚀 Guía para Subir el Proyecto a GitHub

Esta guía te ayudará a subir tu proyecto de Gestor de Licencias a GitHub paso a paso.

## 📋 Prerrequisitos

1. **Cuenta de GitHub**: Asegúrate de tener una cuenta en GitHub
2. **Git configurado**: Verifica que Git esté configurado en tu máquina
3. **Autenticación**: Configura tu autenticación con GitHub (SSH o HTTPS)

## 🔧 Configuración Inicial

### 1. Verificar configuración de Git
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@ejemplo.com"
```

### 2. Configurar autenticación con GitHub

#### Opción A: Usando HTTPS (Recomendado para principiantes)
```bash
# Configurar credenciales
git config --global credential.helper store
```

#### Opción B: Usando SSH
```bash
# Generar clave SSH (si no la tienes)
ssh-keygen -t ed25519 -C "tu.email@ejemplo.com"

# Agregar la clave a ssh-agent
ssh-add ~/.ssh/id_ed25519

# Copiar la clave pública (agrégala a GitHub)
cat ~/.ssh/id_ed25519.pub
```

## 📤 Pasos para Subir a GitHub

### Paso 1: Crear el repositorio en GitHub

1. Ve a [GitHub.com](https://github.com) y inicia sesión
2. Haz clic en el botón **"New"** o **"+"** en la esquina superior derecha
3. Selecciona **"New repository"**
4. Completa la información:
   - **Repository name**: `gestor-licencias-api`
   - **Description**: `Sistema completo de gestión de licencias con API REST y frontend React`
   - **Visibility**: Elige público o privado según prefieras
   - **NO** marques "Initialize this repository with a README" (ya tienes uno)
5. Haz clic en **"Create repository"**

### Paso 2: Conectar tu repositorio local con GitHub

#### Si usas HTTPS:
```bash
git remote add origin https://github.com/TU_USUARIO/gestor-licencias-api.git
```

#### Si usas SSH:
```bash
git remote add origin git@github.com:TU_USUARIO/gestor-licencias-api.git
```

### Paso 3: Subir el código

```bash
# Cambiar a la rama main (si no estás en ella)
git branch -M main

# Subir el código
git push -u origin main
```

## 🎯 Comandos Completos

Aquí tienes la secuencia completa de comandos:

```bash
# 1. Verificar estado actual
git status

# 2. Agregar el repositorio remoto (reemplaza TU_USUARIO con tu nombre de usuario)
git remote add origin https://github.com/TU_USUARIO/gestor-licencias-api.git

# 3. Cambiar a la rama main
git branch -M main

# 4. Subir el código
git push -u origin main
```

## 🔄 Comandos para Futuras Actualizaciones

Una vez que hayas subido el proyecto, para futuras actualizaciones usa:

```bash
# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir cambios
git push
```

## 🌐 Configuración de GitHub Pages (Opcional)

Si quieres mostrar una demo del frontend:

1. Ve a tu repositorio en GitHub
2. Ve a **Settings** > **Pages**
3. En **Source**, selecciona **Deploy from a branch**
4. Selecciona la rama `main` y la carpeta `/docs`
5. Haz clic en **Save**

## 🔧 Configuración de GitHub Actions

El proyecto ya incluye un workflow de CI/CD en `.github/workflows/ci.yml`. Para activarlo:

1. Ve a tu repositorio en GitHub
2. Ve a **Actions**
3. El workflow se ejecutará automáticamente en cada push

## 📝 Configuración de Secrets (Opcional)

Para el despliegue automático, puedes configurar secrets en GitHub:

1. Ve a tu repositorio > **Settings** > **Secrets and variables** > **Actions**
2. Agrega los siguientes secrets:
   - `VITE_API_URL`: URL de tu API en producción
   - `JWT_SECRET`: Tu secreto JWT
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Credenciales de base de datos

## 🐛 Solución de Problemas

### Error: "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/gestor-licencias-api.git
```

### Error: "Permission denied"
- Verifica que tu autenticación esté configurada correctamente
- Si usas SSH, asegúrate de que tu clave esté agregada a GitHub

### Error: "Large file detected"
- El archivo `backup.sql` puede ser muy grande
- Considera agregarlo a `.gitignore` o usar Git LFS

## 📚 Recursos Adicionales

- [Documentación oficial de Git](https://git-scm.com/doc)
- [Guía de GitHub](https://docs.github.com/)
- [GitHub CLI](https://cli.github.com/) - Herramienta de línea de comandos para GitHub

## ✅ Verificación Final

Después de subir el proyecto, verifica que:

1. ✅ El repositorio esté visible en GitHub
2. ✅ Todos los archivos estén presentes
3. ✅ El README.md se muestre correctamente
4. ✅ Los workflows de GitHub Actions se ejecuten (si los activaste)
5. ✅ El proyecto se pueda clonar en otra máquina

---

¡Felicidades! 🎉 Tu proyecto de Gestor de Licencias ya está en GitHub y listo para ser compartido con el mundo. 
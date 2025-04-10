## Crear un servidor Express con TypeScript

1. Instalar dependencias necesarias:
    ```bash
    npm install express, ethers, dotenv
    npm install --save-dev @types/express typescript ts-node
    ```

2. Crear un archivo `tsconfig.json` para configurar TypeScript:
    ```json
    {
      "compilerOptions": {
         "target": "ES6",
         "module": "commonjs",
         "outDir": "./dist",
         "rootDir": "./src",
         "strict": true
      }
    }
    ```

3. Crear un archivo `src/index.ts` 

4. Ejecutar el servidor:
    ```bash
        npx nodemon  --exec npx ts-node index.ts
    ```

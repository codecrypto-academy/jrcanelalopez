```bash
docker run --name mysql-server -e MYSQL_ROOT_PASSWORD=mysql -p 2206:3306 -d mysql:latest
```

```bash
docker run --name postgres-server -e POSTGRES_PASSWORD=postgres -p 5437:5432 -d postgres:latest
```

```bash
docker run --name mssql-server -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=Your_password123' -p 1433:1433 -d mcr.microsoft.com/mssql/server:latest
```

```bash
docker run --platform linux/amd64 --name oracle-xe -p 1521:1521 -p 5500:5500 -e ORACLE_PASSWORD=oracle -d gvenzl/oracle-xe
```

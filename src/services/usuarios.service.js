const { AppDataSource } = require('../config/database');
const bcrypt = require('bcrypt');

class UsuariosService {
  static getRepository() {
    return AppDataSource.getRepository('Usuario');
  }

  static async getAll() {
    return await this.getRepository().find({
      relations: ['departamento', 'puesto']
    });
  }

  static async getById(id) {
    return await this.getRepository().findOne({
      where: { id },
      relations: ['departamento', 'puesto']
    });
  }

  static async create(data) {
    const repo = this.getRepository();
    // Hashear password si viene
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const usuario = repo.create(data);
    return await repo.save(usuario);
  }

  static async update(id, data) {
    const repo = this.getRepository();
    const usuario = await repo.findOneBy({ id });
    if (!usuario) return null;
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    repo.merge(usuario, data);
    return await repo.save(usuario);
  }

  static async delete(id) {
    const repo = this.getRepository();
    const usuario = await repo.findOneBy({ id });
    if (!usuario) return null;
    await repo.remove(usuario);
    return usuario;
  }

  static async findByEmail(email) {
    return await this.getRepository().findOneBy({ email });
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UsuariosService; 
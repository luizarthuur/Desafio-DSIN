const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test_secret';

const { autenticar, autorizarAdmin } = require('./authMiddleware');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('autenticar', () => {
    test('deve chamar next com usuário decodificado quando token for válido', () => {
      const payload = { id: 1, email: 'teste@email.com', role: 'cliente' };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;

      autenticar(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.usuario).toMatchObject(payload);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('deve retornar 401 se token não for fornecido', () => {
      autenticar(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Token não fornecido' });
    });

    test('deve retornar 401 se token for inválido', () => {
      req.headers.authorization = 'Bearer token_invalido';
      autenticar(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Token inválido' });
    });
  });

  describe('autorizarAdmin', () => {
    test('deve chamar next se usuário for admin', () => {
      req.usuario = { role: 'admin' };
      autorizarAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('deve retornar 403 se usuário não for admin', () => {
      req.usuario = { role: 'cliente' };
      autorizarAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Acesso negado: requer privilégios de administrador' });
    });
  });
});
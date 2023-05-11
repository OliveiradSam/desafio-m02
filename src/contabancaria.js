let {
  banco,
  contas,
  numero,
  depositos,
  saques,
  transferencias,
} = require("./bancodedados");
const bancodedados = require("./bancodedados");

const listarContas = (req, res) => {
  const { senha_banco } = req.query;
  if (!senha_banco) {
    return res.json("A senha do banco deve ser informada");
  }
  if (senha_banco !== banco.senha) {
    return res.json("A senha do banco informada é inválida!");
  }
  return res.json(contas);
};

const cadastroBanco = (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
    return res.status(400).json("Todos os campos são obrigatórios");
  }
  const cpfEmUso = contas.find((contas) => {
    return contas.usuario.cpf === cpf;
  });
  const emailEmUso = contas.find((contas) => {
    return contas.usuario.email === email;
  });
  if (cpfEmUso) {
    return res.status(400).json(`CPF ${cpfEmUso.usuario.cpf} já está em uso`);
  } else if (emailEmUso) {
    return res
      .status(400)
      .json(`Email ${emailEmUso.usuario.email} já está em uso`);
  }

  const conta = {
    numero: ++numero,
    saldo: 0,
    usuario: {
      nome,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha,
    },
  };

  contas.push(conta);
  return res.status(201).send();
};

const atualizarContas = (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
    return res.status(400).json("Todos os campos são obrigatórios");
  }
  const cpfEmUso = contas.find((contas) => {
    return contas.usuario.cpf === cpf;
  });
  const emailEmUso = contas.find((contas) => {
    return contas.usuario.email === email;
  });
  const senhaEmUso = contas.find((contas) => {
    return contas.usuario.email === email;
  });

  if (cpfEmUso) {
    return res.status(400).json(`CPF ${cpfEmUso.usuario.cpf} já está em uso`);
  } else if (emailEmUso) {
    return res
      .status(400)
      .json(`Email ${emailEmUso.usuario.email} já está em uso`);
  } else if (senhaEmUso) {
    return res
      .status(400)
      .json(`Email ${senhaEmUso.usuario.senha} já está em uso`);
  }

  const contaExistent = contas.find(
    (conta) => conta.numero === Number(req.params.numeroConta)
  );

  if (!contaExistent) {
    return res.status(400).json(`Conta não encontrada`);
  }

  contaExistent.usuario.nome = nome;
  contaExistent.usuario.cpf = cpf;
  contaExistent.usuario.data_nascimento = data_nascimento;
  contaExistent.usuario.telefone = telefone;
  contaExistent.usuario.email = email;
  contaExistent.usuario.senha = senha;

  return res.status(204).json();
};

const deletarConta = (req, res) => {
  const { banco } = req.body;

  const contaExistent = contas.find(
    (conta) => conta.numero === Number(req.params.numeroConta)
  );
  if (contaExistent) {
    return res.status(201).json();
  } else {
    return res
      .status(400)
      .json("A conta só pode ser removida se o saldo for zero!");
  }
};

const depositar = (req, res) => {
  const { numero_conta, valor } = req.body;

  if (!numero_conta || !valor) {
    return res.status(400).json("Todos os campos são obrigatórios!");
  }

  const contaExistent = contas.find((conta) => conta.numero === numero_conta);

  if (!contaExistent) {
    return res.status(400).json("Essa conta não existe");
  }

  contaExistent.saldo += Number(valor);

  const horario = new Date();

  const deposito = {
    data: horario,
    numero_conta,
    valor: valor,
  };

  depositos.push(deposito);

  return res.status(201).send();
};

const sacar = (req, res) => {
  const { numero_conta, valor, senha, saldo } = req.body;

  if (!numero_conta || !valor || !senha) {
    return res.status(400).json("Todos os campos são obrigatórios!");
  }

  const contaExistent = contas.find((conta) => conta.numero === numero_conta);

  if (!contaExistent) {
    return res.status(400).json("Essa conta não existe");
  }

  const conferirSenha = contas.find((conta) => conta.usuario.senha === senha);

  if (!conferirSenha) {
    return res.status(400).json("Senha incorreta");
  }

  if (contaExistent.saldo === 0 || contaExistent.saldo - valor < 0) {
    return res.status(400).json("Saldo indisponível");
  }

  const horario = new Date();

  const saque = {
    data: horario,
    numero_conta,
    valor,
  };

  contaExistent.saldo -= valor;

  saques.push(saque);
  return res.status(201).send();
};

const transferir = (req, res) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

  if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
    res.status(400).json("Todos os campos são obrigatórios!");
  }

  if (numero_conta_origem === numero_conta_destino) {
    res
      .status(400)
      .json("Não é possivel fazer uma transferencia para a mesma conta");
  }

  const contaOrigemExist = contas.find(
    (conta) => conta.numero === numero_conta_origem
  );
  const contaDestinoExist = contas.find(
    (conta) => conta.numero === numero_conta_destino
  );

  if (!contaOrigemExist) {
    return res.status(400).json("A conta origem não existe");
  }
  if (!contaDestinoExist) {
    return res.status(400).json("A conta destino não existe");
  }

  const conferirSenha = contas.find((conta) => conta.usuario.senha === senha);

  if (!conferirSenha) {
    return res.status(400).json("Senha incorreta");
  }

  if (contaOrigemExist.saldo === 0 || contaOrigemExist.saldo - valor < 0) {
    return res.status(400).json("Saldo indisponível");
  }

  contaOrigemExist.saldo -= valor;
  contaDestinoExist.saldo += valor;

  const horario = new Date();

  const transferir = {
    data: horario,
    numero_conta_origem,
    numero_conta_destino,
    valor,
  };

  transferencias.push(transferir);
  return res.status(201).send();
};

const saldo = (req, res) => {
  const { numero_conta, senha } = req.query;

  if (!numero_conta || !senha) {
    return res.json("Todos os campos devem ser preenchidos");
  }

  const conta = contas.find((conta) => conta.numero === Number(numero_conta));

  if (!conta) {
    return res.json("Conta bancária não encontrada");
  }
  if (senha !== conta.usuario.senha) {
    return res.json("A senha do banco informada é inválida!");
  }

  return res.status(201).json({ saldo: `${Number(conta.saldo)}` });
};

module.exports = {
  cadastroBanco,
  listarContas,
  atualizarContas,
  deletarConta,
  depositar,
  sacar,
  transferir,
  saldo,
};

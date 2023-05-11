const express = require("express");
const {
  cadastroBanco,
  listarContas,
  atualizarContas,
  deletarConta,
  depositar,
  sacar,
  transferir,
  saldo,
  extrato,
} = require("./contabancaria");

const roteador = express();

roteador.get("/contas", listarContas);

roteador.post("/contas", cadastroBanco);

roteador.put("/contas/:numeroConta/usuario", atualizarContas);

roteador.delete("/contas/:numeroConta", deletarConta);

roteador.post("/transacoes/depositar", depositar);

roteador.post("/transacoes/sacar", sacar);

roteador.post("/transacoes/transferir", transferir);

roteador.get("/contas/saldo/", saldo);

// roteador.get("/contas/extrato", extrato);
module.exports = roteador;

<?php
$host = "caboose.proxy.rlwy.net"; // Seu host do Railway
$port = "22510"; // Porta do banco de dados
$usuario = "root"; // Usuário do MySQL
$senha = "UCxAzuhWDFTuuEZOJFZCOMVCJCJLKFWC"; // Sua senha
$banco = "railway"; // Nome do banco

// Criar conexão
$conn = new mysqli($host, $usuario, $senha, $banco, $port);

// Verificar conexão
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
} 

// Mensagem de sucesso (para testar)
echo "Conectado ao banco de dados com sucesso!";
?>

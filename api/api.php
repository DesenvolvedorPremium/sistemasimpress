<?php
header('Content-Type: application/json');
require_once 'config.php';

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'get_old_printers':
            $stmt = $pdo->query("SELECT * FROM old_printers");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        case 'get_new_printers':
            $stmt = $pdo->query("SELECT * FROM new_printers");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        case 'get_replacements':
            $stmt = $pdo->query("SELECT * FROM replacements");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        case 'add_printer':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if ($data['type'] === 'old') {
                $stmt = $pdo->prepare("INSERT INTO old_printers (serial_number, model, status, orgao_responsavel, bloco, andar, sala, department, ip_address) 
                                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $data['serial'],
                    $data['model'],
                    $data['status'],
                    $data['orgao'],
                    $data['bloco'],
                    $data['andar'],
                    $data['sala'],
                    $data['department'],
                    $data['ip']
                ]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO new_printers (serial_number, model, online, orgao_responsavel, bloco, andar, sala, department, ip_address, hostname, auto_trafo) 
                                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $data['serial'],
                    $data['model'],
                    $data['online'],
                    $data['orgao'],
                    $data['bloco'],
                    $data['andar'],
                    $data['sala'],
                    $data['department'],
                    $data['ip'],
                    $data['hostname'],
                    $data['auto_trafo']
                ]);
            }
            
            echo json_encode(['success' => true]);
            break;
            
        case 'add_replacement':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("INSERT INTO replacements (old_serial, new_serial, replacement_date, new_model, new_bloco, new_andar, new_sala, new_department, new_ip, new_online, new_auto_trafo, new_hostname) 
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['oldSerial'],
                $data['newSerial'],
                date('Y-m-d'),
                $data['newModel'],
                $data['newBloco'],
                $data['newAndar'],
                $data['newSala'],
                $data['newDepartment'],
                $data['newIp'],
                $data['newOnline'],
                $data['newAutoTrafo'],
                $data['newHostname']
            ]);
            
            echo json_encode(['success' => true]);
            break;
            
        default:
            echo json_encode(['error' => 'Ação não reconhecida']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>

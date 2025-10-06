import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Alert,
  Button,
} from 'react-native';

import * as Database from './services/Database';
import Formulario from './components/Formulario';
import ListaRegistros from './components/ListaRegistros';
import Grafico from './components/Grafico';

import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [ordenacao, setOrdenacao] = useState('recentes');

  useEffect(() => {
    const init = async () => {
      const dados = await Database.carregarDados();
      setRegistros(dados);
      setCarregando(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!carregando) {
      Database.salvarDados(registros);
    }
  }, [registros, carregando]);

  const handleSave = (horasEstudo, horasTrabalho, horasTreino) => {
    const estudoNum = parseFloat(String(horasEstudo).replace(',', '.'));
    const trabalhoNum = parseFloat(String(horasTrabalho).replace(',', '.'));
    const treinoNum = parseFloat(String(horasTreino).replace(',', '.'));

    if (estudoNum < 0 || trabalhoNum < 0 || treinoNum < 0) {
      return Alert.alert("Erro", "Valores não podem ser negativos!");
    }

    if (editingId) {
      const registrosAtualizados = registros.map(reg =>
        reg.id === editingId
          ? { ...reg, estudo: estudoNum, trabalho: trabalhoNum, treino: treinoNum }
          : reg
      );
      setRegistros(registrosAtualizados);
      Alert.alert('Sucesso!', 'Registro atualizado!');
    } else {
      const novoRegistro = {
        id: new Date().getTime(),
        estudo: estudoNum,
        trabalho: trabalhoNum,
        treino: treinoNum,
        data: new Date().toLocaleDateString('pt-BR'),
      };
      setRegistros([...registros, novoRegistro]);
      Alert.alert('Sucesso!', 'Seu registro foi salvo!');
    }

    setEditingId(null);
  };

  const handleDelete = (id) => {
    setRegistros(registros.filter(reg => reg.id !== id));
    Alert.alert('Sucesso!', 'O registro foi deletado.');
  };

  const handleEdit = (registro) => {
    setEditingId(registro.id);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const exportarDados = async () => {
    const fileUri = Database.fileUri;
    if (Platform.OS === 'web') {
      const jsonString = JSON.stringify(registros, null, 2);
      if (registros.length === 0) {
        return Alert.alert("Aviso", "Nenhum dado para exportar.");
      }
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dados.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        return Alert.alert("Aviso", "Nenhum dado para exportar.");
      }
      if (!(await Sharing.isAvailableAsync())) {
        return Alert.alert("Erro", "Compartilhamento não disponível.");
      }
      await Sharing.shareAsync(fileUri);
    }
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  // 🔽 Ordenação correta:
  let registrosExibidos = [...registros];

  if (ordenacao === 'maior_estudo') {
    registrosExibidos.sort((a, b) => a.estudo - b.estudo);
  } else if (ordenacao === 'maior_trabalho') {
    registrosExibidos.sort((a, b) => a.trabalho - b.trabalho);
  } else if (ordenacao === 'maior_treino') {
    registrosExibidos.sort((a, b) => a.treino - b.treino);
  } else {
    registrosExibidos.sort((a, b) => a.id - b.id);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.titulo}>AnotaAI</Text>
        <Text style={styles.subtituloApp}>App Componentizado</Text>

        <Formulario
          onSave={handleSave}
          onCancel={handleCancel}
          registroEmEdicao={registros.find(r => r.id === editingId) || null}
        />

        {/* 🔘 Botões de Filtro */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
          <Button title="Mais Recentes" onPress={() => setOrdenacao('recentes')} />
          <Button title="Maior Estudo" onPress={() => setOrdenacao('maior_estudo')} />
          <Button title="Maior Trabalho" onPress={() => setOrdenacao('maior_trabalho')} />
          <Button title="Maior Treino" onPress={() => setOrdenacao('maior_treino')} />
        </View>

        {/* 📈 Gráfico */}
        <Grafico registros={registrosExibidos} />

        {/* 📋 Lista de Registros */}
        <ListaRegistros
          registros={registrosExibidos}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* 📁 Exportar dados */}
        <View style={styles.card}>
          <Text style={styles.subtitulo}>Exportar "Banco de Dados"</Text>
          <TouchableOpacity style={styles.botaoExportar} onPress={exportarDados}>
            <Text style={styles.botaoTexto}>Exportar arquivo dados.json</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    backgroundColor: '#6EC5DB'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#171414'
  },
  subtituloApp: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6E6D6D',
    marginTop: -20,
    marginBottom: 20,
    fontStyle: 'italic'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    elevation: 3
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2198B5'
  },
  botaoExportar: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5
  },
  botaoTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

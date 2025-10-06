import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function Grafico({ registros }) {
  if (!registros || registros.length < 2) {
    return (
      <Text style={{ textAlign: 'center', margin: 10 }}>
        Adicione pelo menos 2 registros para ver o gráfico.
      </Text>
    );
  }

  // Ordenar os registros pela data (id)
  const registrosOrdenados = [...registros].sort((a, b) => a.id - b.id);

  // Preparar labels e dados
  const labels = registrosOrdenados.map(reg => {
    const date = new Date(reg.id);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')}`;
  });

  const dataTreino = registrosOrdenados.map(reg => reg.treino);

  const data = {
    labels,
    datasets: [
      {
        data: dataTreino,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // linha branca
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#4caf50',
    backgroundGradientFrom: '#81c784',
    backgroundGradientTo: '#388e3c',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#ffffff',
    },
  };

  return (
    <View>
      <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, marginBottom: 5, color: '#2e7d32' }}>
        Evolução das Horas de Treino
      </Text>
      <LineChart
        data={data}
        width={Dimensions.get('window').width - 40}
        height={240}
        yAxisSuffix="h"
        chartConfig={chartConfig}
        bezier
        style={{ marginVertical: 8, borderRadius: 16, elevation: 3 }}
        fromZero={true}
      />
    </View>
  );
}

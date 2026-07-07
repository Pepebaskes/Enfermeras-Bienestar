export type ImcResult = {
  value: number;
  formattedValue: string;
  label: string;
  note?: string;
};

const getHeightInMeters = (height?: number) => {
  if (!height || height <= 0) {
    return undefined;
  }

  return height > 3 ? height / 100 : height;
};

export const calculateImc = (weight?: number, height?: number, age?: number): ImcResult | undefined => {
  const heightInMeters = getHeightInMeters(height);

  if (!weight || weight <= 0 || !heightInMeters) {
    return undefined;
  }

  const value = weight / (heightInMeters * heightInMeters);
  if (!Number.isFinite(value)) {
    return undefined;
  }

  const roundedValue = Math.round(value * 10) / 10;
  const isAdult = typeof age === 'number' ? age >= 20 : true;

  if (!isAdult) {
    return {
      value: roundedValue,
      formattedValue: roundedValue.toFixed(1),
      label: 'IMC calculado',
      note: 'En menores de 20 anos se interpreta con percentiles por edad y sexo.'
    };
  }

  if (roundedValue < 18.5) {
    return {
      value: roundedValue,
      formattedValue: roundedValue.toFixed(1),
      label: 'Bajo peso'
    };
  }

  if (roundedValue < 25) {
    return {
      value: roundedValue,
      formattedValue: roundedValue.toFixed(1),
      label: 'Peso normal'
    };
  }

  if (roundedValue < 30) {
    return {
      value: roundedValue,
      formattedValue: roundedValue.toFixed(1),
      label: 'Sobrepeso'
    };
  }

  return {
    value: roundedValue,
    formattedValue: roundedValue.toFixed(1),
    label: 'Obesidad'
  };
};

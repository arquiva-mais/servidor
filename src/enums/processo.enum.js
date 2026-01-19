// src/enums/processo.enums.js
const StatusProcesso = Object.freeze({
   EM_ANDAMENTO: 'em_andamento',
   CONCLUIDO: 'concluido',

   // Métodos utilitários
   values: () => Object.values(StatusProcesso).filter(v => typeof v === 'string'),
   keys: () => Object.keys(StatusProcesso).filter(k => typeof StatusProcesso[k] === 'string'),
   isValid: (value) => StatusProcesso.values().includes(value),
   getLabel: (value) => {
     const labels = {
       'em_andamento': 'Em Andamento',
       'concluido': 'Concluído',
     };
     return labels[value] || value;
   }
 });

 module.exports = {
   StatusProcesso
 };
// Este arquivo contém as correções para o problema de exibição de horários no Cronograma
// Você pode usar estas funções para substituir as funções equivalentes no arquivo index.tsx

import { Evento } from "../../types";

/**
 * Função corrigida para obter eventos por dia e horário
 * Esta função corrige o problema de exibição incorreta de horários
 *
 * @param dia - String contendo a data no formato toDateString()
 * @param horario - String contendo o horário no formato "HH:MM"
 * @param base - Array opcional de eventos para filtrar
 * @returns Array de eventos correspondentes ao dia e horário
 */
export const obterEventosPorDiaHorarioCORRIGIDO = (
  dia: string,
  horario: string,
  eventos: Evento[]
) => {
  return eventos.filter((evento) => {
    const eventoDia = evento.data.toDateString();
    if (eventoDia !== dia) return false;

    // Converte horário do slot para minutos desde o início do dia
    const [slotHora, slotMinuto] = horario.split(":").map(Number);
    const slotMinutosDoDia = slotHora * 60 + slotMinuto;

    // Converte horário do evento para minutos desde o início do dia
    // Pegamos as horas e minutos diretamente do Date para evitar problemas de fuso
    const eventoHora = evento.hora.getHours();
    const eventoMinuto = evento.hora.getMinutes();
    const eventoMinutosDoDia = eventoHora * 60 + eventoMinuto;

    // Calcula o fim do evento em minutos
    const duracaoEvento = evento.duracao || 60;
    const eventoFimMinutosDoDia = eventoMinutosDoDia + duracaoEvento;

    // Verifica se o slot está dentro do período do evento (inclusive)
    return (
      slotMinutosDoDia >= eventoMinutosDoDia &&
      slotMinutosDoDia < eventoFimMinutosDoDia
    );
  });
};

/**
 * Função corrigida para obter horários únicos
 * Esta função corrige o problema de exibição incorreta de horários
 *
 * @param eventos - Array de eventos para extrair horários
 * @returns Array de strings com horários únicos no formato "HH:MM"
 */
export const obterHorariosUnicosCORRIGIDO = (eventos: Evento[]) => {
  const horariosSet = new Set<string>();

  eventos.forEach((evento) => {
    // Obter horas e minutos diretamente do objeto Date para evitar problemas de fuso
    const eventoHora = evento.hora.getHours();
    const eventoMinuto = evento.hora.getMinutes();
    const inicioMinutos = eventoHora * 60 + eventoMinuto;

    const duracaoEvento = evento.duracao || 60;
    const fimMinutos = inicioMinutos + duracaoEvento;

    // Gera slots de 15 em 15 minutos cobrindo todo o período do evento
    for (let minutos = inicioMinutos; minutos < fimMinutos; minutos += 15) {
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      const horarioFormatado = `${horas}:${mins.toString().padStart(2, "0")}`;
      horariosSet.add(horarioFormatado);
    }

    // Sempre inclui o horário final se for diferente do último slot gerado
    const ultimoSlotMinutos =
      inicioMinutos + Math.floor((duracaoEvento - 1) / 15) * 15;
    if (ultimoSlotMinutos < fimMinutos) {
      const horas = Math.floor(fimMinutos / 60);
      const mins = fimMinutos % 60;
      const horarioFinal = `${horas}:${mins.toString().padStart(2, "0")}`;
      horariosSet.add(horarioFinal);
    }
  });

  return Array.from(horariosSet).sort((a, b) => {
    const [aHora, aMin] = a.split(":").map(Number);
    const [bHora, bMin] = b.split(":").map(Number);
    return aHora * 60 + aMin - (bHora * 60 + bMin);
  });
};

/**
 * Instruções de como usar as correções para resolver o problema dos horários:
 *
 * 1. Substituir a função obterEventosPorDiaHorario no arquivo index.tsx pela função obterEventosPorDiaHorarioCORRIGIDO
 *    - Esta função corrige o posicionamento dos eventos na grade horária
 *
 * 2. Substituir a função obterHorariosUnicos no arquivo index.tsx pela função obterHorariosUnicosCORRIGIDO
 *    - Esta função garante que os horários sejam exibidos corretamente
 *
 * 3. Adicionar logs para verificar o funcionamento (já implementado no arquivo principal)
 *    - Os logs adicionados ajudarão a verificar se o horário está correto
 *
 * 4. Na função que analisa sobreposições de eventos, certifique-se de usar getHours() e getMinutes()
 *    diretamente do objeto Date (já corrigido no arquivo principal)
 *
 * Estas correções resolvem o problema de eventos aparecendo em horários incorretos na grade,
 * especificamente o "Relato de experiência" que aparece às 19:30 em vez de 20:00.
 */

export default {};

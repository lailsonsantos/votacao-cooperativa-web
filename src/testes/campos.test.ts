import { describe, expect, it } from 'vitest';
import { paraBrasileiro, paraIso } from '../mobile/campos/data';

/**
 * Testes da conversao de data entre o formato do Anexo 1 e o do input nativo.
 *
 * O PDF usa `dd/MM/yyyy` e o `<input type="date">` exige `yyyy-MM-dd`. Errar a
 * conversao produziria um campo que parece funcionar na tela mas envia lixo ao
 * servidor — o tipo de bug que so aparece em producao.
 */
describe('conversao de data do Anexo 1', () => {
  it('converte dd/MM/yyyy para o formato ISO do input nativo', () => {
    expect(paraIso('01/01/2000')).toBe('2000-01-01');
    expect(paraIso('31/12/2026')).toBe('2026-12-31');
  });

  it('normaliza dia e mes com um digito', () => {
    expect(paraIso('1/2/2026')).toBe('2026-02-01');
  });

  it('converte de volta para o formato do Anexo 1', () => {
    expect(paraBrasileiro('2000-01-01')).toBe('01/01/2000');
  });

  it('devolve string vazia para entrada invalida em vez de quebrar', () => {
    expect(paraIso('')).toBe('');
    expect(paraIso('nao e data')).toBe('');
    expect(paraBrasileiro('')).toBe('');
  });

  it('faz a ida e a volta sem perder informacao', () => {
    expect(paraBrasileiro(paraIso('15/03/2026'))).toBe('15/03/2026');
  });
});

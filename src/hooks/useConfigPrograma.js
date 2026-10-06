import { useCallback, useState } from 'react';
import {
  carregarConfigPrograma,
  salvarConfigPrograma,
} from '../storage/configPrograma';

export function useConfigPrograma() {
  const [config, setConfig] = useState(() => carregarConfigPrograma());
  const [erro, setErro] = useState(null);

  const confirmarInicio = useCallback((inicio) => {
    const resultado = salvarConfigPrograma(inicio);
    setErro(resultado.ok ? null : resultado.erro);
    if (resultado.ok) setConfig(resultado.config);
    return resultado;
  }, []);

  const descartarErro = useCallback(() => setErro(null), []);

  return {
    config,
    erro,
    confirmarInicio,
    descartarErro,
  };
}

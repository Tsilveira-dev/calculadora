# Simulador de Parcelas

> Simulador de parcelamentos com ou sem juros, desenvolvido com HTML, CSS e JavaScript puro.


# Demo ao vivo

[Acessar o simulador](https://Tsilveira-dev.github.io/calculadora)

# Funcionalidades

- **Simulação sem juros** — divide o valor igualmente pelas parcelas
- **Simulação com juros mensais ou anuais** — usa a Tabela Price (sistema francês)
- **Prévia em tempo real** — atualiza enquanto você digita
- **Cronograma completo** — mostra juros, amortização e saldo devedor de cada parcela
- **Comparação de cenários** — compara de 1 a 36x automaticamente
- **Exportar CSV** — baixe o cronograma em planilha
- **Design responsivo** — funciona em mobile e desktop

# Como usar

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/simuladorparcela.git
   cd simuladorparcela
   ```

2. Abra o `index.html` no navegador (sem servidor necessário!):
   ```bash
   # No VS Code, use Live Server
   # Ou abra direto no browser
   open index.html
   ```

# Como funciona o cálculo

### Sem juros
```
Parcela = Valor financiado ÷ n
```

### Com juros (Tabela Price)
```
PMT = PV × [i × (1+i)ⁿ] ÷ [(1+i)ⁿ − 1]

Onde:
  PMT = parcela mensal
  PV  = valor financiado (presente)
  i   = taxa mensal (taxa anual é convertida: i = (1+a)^(1/12) - 1)
  n   = número de parcelas
```

# Estrutura

```
simulaparc/
├── index.html   # Estrutura da página
├── style.css    # Estilos (CSS custom properties, responsivo)
├── app.js       # Lógica de cálculo e interatividade
└── README.md
```

# Tecnologias

- **HTML5** semântico
- **CSS3** com custom properties (variáveis), Grid, Flexbox, animações
- **JavaScript ES6+** vanilla (sem frameworks ou dependências)
- **Google Fonts** — Space Grotesk + JetBrains Mono

# Licença

MIT — use livremente para estudos e portfólio.

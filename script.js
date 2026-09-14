// script.js
// Consome a PokeAPI (https://pokeapi.co/) e exibe os dados do Pokémon buscado.

const form = document.getElementById("form-busca");
const campoBusca = document.getElementById("campo-busca");
const tela = document.getElementById("resultado");

const NOMES_STATS = {
  hp: "HP",
  attack: "Ataque",
  defense: "Defesa",
  "special-attack": "Sp. Atq",
  "special-defense": "Sp. Def",
  speed: "Veloc.",
};

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const termo = campoBusca.value.trim().toLowerCase();

  if (!termo) {
    mostrarErro("Digite um nome ou número", "Ex.: pikachu, 25, charizard…");
    return;
  }

  buscarPokemon(termo);
});

async function buscarPokemon(termo) {
  mostrarCarregando();

  try {
    const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${termo}`);

    if (resposta.status === 404) {
      mostrarErro("Pokémon não encontrado", `Não existe nenhum resultado para "${termo}".`);
      return;
    }

    if (!resposta.ok) {
      // A API respondeu, mas com algum problema no servidor (5xx, etc.)
      throw new Error(`Erro ${resposta.status}`);
    }

    const dados = await resposta.json();
    mostrarResultado(dados);

  } catch (erro) {
    // Cobre falha de rede, CORS, timeout ou API fora do ar
    console.error("Falha ao buscar Pokémon:", erro);
    mostrarErro(
      "Não foi possível consultar a Pokédex agora",
      "Verifique sua conexão e tente novamente em instantes."
    );
  }
}

function mostrarCarregando() {
  tela.innerHTML = `
    <div class="screen__loading">
      <p>Consultando a Pokédex…</p>
    </div>
  `;
}

function mostrarErro(titulo, mensagem) {
  tela.innerHTML = `
    <div class="screen__error">
      <strong>${escapeHTML(titulo)}</strong>
      <p>${escapeHTML(mensagem)}</p>
    </div>
  `;
}

function mostrarResultado(dados) {
  const numero = String(dados.id).padStart(3, "0");
  const sprite = dados.sprites?.front_default || "";

  const tipos = dados.types
    .map((t) => `<span class="badge type-${t.type.name}">${t.type.name}</span>`)
    .join("");

  const alturaMetros = (dados.height / 10).toFixed(1);   // decímetros -> metros
  const pesoKg = (dados.weight / 10).toFixed(1);          // hectogramas -> kg

  const barrasStats = dados.stats
    .map((s) => {
      const nome = NOMES_STATS[s.stat.name] || s.stat.name;
      const valor = s.base_stat;
      const largura = Math.min(100, (valor / 180) * 100);
      return `
        <div class="bar-row">
          <span class="bar-row__label">${escapeHTML(nome)}</span>
          <span class="bar-track"><span class="bar-fill" style="width:${largura}%"></span></span>
          <span class="bar-row__value">${valor}</span>
        </div>
      `;
    })
    .join("");

  const habilidades = dados.abilities
    .map((a) => a.ability.name.replace(/-/g, " "))
    .join(", ");

  tela.innerHTML = `
    <div class="result">
      <div class="result__top">
        <img class="result__sprite" src="${sprite}" alt="Sprite de ${escapeHTML(dados.name)}">
        <div>
          <p class="result__id">#${numero}</p>
          <h2 class="result__name">${escapeHTML(dados.name)}</h2>
          <div class="result__types">${tipos}</div>
        </div>
      </div>

      <div class="result__stats">
        <div class="stat-block">
          <span class="stat-block__value">${alturaMetros} m</span>
          <span class="stat-block__label">Altura</span>
        </div>
        <div class="stat-block">
          <span class="stat-block__value">${pesoKg} kg</span>
          <span class="stat-block__label">Peso</span>
        </div>
        <div class="stat-block">
          <span class="stat-block__value">${dados.base_experience ?? "—"}</span>
          <span class="stat-block__label">Exp. base</span>
        </div>
      </div>

      <p class="result__section-title">Status base</p>
      <div class="bars">${barrasStats}</div>

      <p class="result__section-title">Habilidades</p>
      <p class="result__abilities">${escapeHTML(habilidades)}</p>
    </div>
  `;
}

// Evita que um nome/erro vindo da API quebre o HTML da página
function escapeHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

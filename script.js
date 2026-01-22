// URL base da PokéAPI
const API_URL = 'https://pokeapi.co/api/v2/pokemon';
const TOTAL_POKEMON = 1025; // Todas as gerações até a 9ª geração (Scarlet/Violet)

// Arrays para armazenar dados
let allPokemon = [];
let filteredPokemon = [];
let allSpecialForms = []; // Armazena todas as formas especiais

// Estados dos filtros especiais
let isShinyMode = false;
let isMegaFilter = false;
let isGmaxFilter = false;
let isFusionFilter = false;

// Tradução dos tipos para português
const typeTranslations = {
    normal: 'Normal',
    fire: 'Fogo',
    water: 'Água',
    grass: 'Planta',
    electric: 'Elétrico',
    ice: 'Gelo',
    fighting: 'Lutador',
    poison: 'Venenoso',
    ground: 'Terra',
    flying: 'Voador',
    psychic: 'Psíquico',
    bug: 'Inseto',
    rock: 'Pedra',
    ghost: 'Fantasma',
    dragon: 'Dragão',
    dark: 'Sombrio',
    steel: 'Metálico',
    fairy: 'Fada'
};

// Tabela de efetividade de tipos (fraquezas)
const typeWeaknesses = {
    normal: ['fighting'],
    fire: ['water', 'ground', 'rock'],
    water: ['electric', 'grass'],
    grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
    electric: ['ground'],
    ice: ['fire', 'fighting', 'rock', 'steel'],
    fighting: ['flying', 'psychic', 'fairy'],
    poison: ['ground', 'psychic'],
    ground: ['water', 'grass', 'ice'],
    flying: ['electric', 'ice', 'rock'],
    psychic: ['bug', 'ghost', 'dark'],
    bug: ['fire', 'flying', 'rock'],
    rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
    ghost: ['ghost', 'dark'],
    dragon: ['ice', 'dragon', 'fairy'],
    dark: ['fighting', 'bug', 'fairy'],
    steel: ['fire', 'fighting', 'ground'],
    fairy: ['poison', 'steel']
};

// Elementos DOM
const pokedexContainer = document.getElementById('pokedex');
const loadingElement = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const generationFilter = document.getElementById('generationFilter');

// Botões de filtro especial
const shinyFilterBtn = document.getElementById('shinyFilter');
const megaFilterBtn = document.getElementById('megaFilter');
const gmaxFilterBtn = document.getElementById('gmaxFilter');
const fusionFilterBtn = document.getElementById('fusionFilter');

// Elementos do Modal
const modal = document.getElementById('pokemonModal');
const closeModalBtn = document.getElementById('closeModal');
const prevPokemonBtn = document.getElementById('prevPokemon');
const nextPokemonBtn = document.getElementById('nextPokemon');
const modalPokemonImage = document.getElementById('modalPokemonImage');
const modalPokemonName = document.getElementById('modalPokemonName');
const modalPokemonTypes = document.getElementById('modalPokemonTypes');
const modalPokemonWeaknesses = document.getElementById('modalPokemonWeaknesses');
const modalPokemonStats = document.getElementById('modalPokemonStats');
const modalEvolutionChain = document.getElementById('modalEvolutionChain');
const modalAlternateForms = document.getElementById('modalAlternateForms');
const alternateFormsSection = document.getElementById('alternateFormsSection');
const shinyImage = document.getElementById('shinyImage');
const shinyCard = document.getElementById('shinyCard');

// Pokémon atual no modal
let currentPokemonIndex = 0;
let currentPokemonData = null;
let isShinyActive = false;

// Ranges de gerações
const generationRanges = {
    '1': { start: 1, end: 151 },
    '2': { start: 152, end: 251 },
    '3': { start: 252, end: 386 },
    '4': { start: 387, end: 493 },
    '5': { start: 494, end: 649 },
    '6': { start: 650, end: 721 },
    '7': { start: 722, end: 809 },
    '8': { start: 810, end: 905 },
    '9': { start: 906, end: 1025 }
};

// Função para buscar dados de um Pokémon
async function fetchPokemon(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Erro ao buscar Pokémon ${id}:`, error);
        return null;
    }
}

// Função para carregar todos os Pokémon
async function loadAllPokemon() {
    loadingElement.classList.remove('hidden');
    pokedexContainer.innerHTML = '';
    
    const promises = [];
    for (let i = 1; i <= TOTAL_POKEMON; i++) {
        promises.push(fetchPokemon(i));
    }
    
    allPokemon = await Promise.all(promises);
    allPokemon = allPokemon.filter(pokemon => pokemon !== null);
    filteredPokemon = [...allPokemon];
    
    loadingElement.classList.add('hidden');
    displayPokemon(filteredPokemon);
    
    // Carrega formas especiais em background
    loadSpecialForms();
}

// Função para carregar formas especiais (Mega, Gmax, Fusões)
async function loadSpecialForms() {
    console.log('Carregando formas especiais...');
    allSpecialForms = [];
    
    // Carrega formas alternativas de Pokémon conhecidos que têm variações
    // Incluindo novos Pokémon do Legends Z-A e outras gerações
    const pokemonWithForms = [
        // Geração 1
        3, 6, 9, 15, 18, 19, 20, 25, 26, 27, 28, 37, 38, 50, 51, 52, 53, 65, 74, 75, 76, 80, 
        88, 89, 94, 103, 105, 115, 127, 130, 142, 144, 145, 146, 150,
        // Geração 2
        181, 201, 208, 212, 214, 229, 248,
        // Geração 3
        254, 257, 260, 282, 302, 303, 306, 308, 310, 319, 323, 334, 351, 354, 359, 362, 373, 
        376, 380, 381, 382, 383, 384, 386,
        // Geração 4
        412, 413, 421, 422, 423, 428, 445, 448, 460, 475, 479, 483, 484, 487, 492,
        // Geração 5
        531, 550, 555, 585, 586, 641, 642, 645, 646, 647, 648, 649,
        // Geração 6
        658, 666, 668, 669, 670, 671, 676, 678, 681, 710, 711, 716, 718, 719, 720,
        // Geração 7
        720, 741, 745, 746, 773, 774, 778, 800, 801, 802, 805,
        // Geração 8
        809, 845, 849, 869, 875, 876, 877, 878, 879, 888, 889, 890, 892, 893, 898,
        // Geração 9
        905, 916, 925, 978, 982, 983, 1017, 1024,
        // Megas adicionais que podem estar no Legends Z-A
        485, 491, 493, // Heatran, Darkrai, Arceus (formas alternativas)
    ];
    
    for (const pokemonId of pokemonWithForms) {
        try {
            const pokemon = await fetchPokemon(pokemonId);
            if (!pokemon) continue;
            
            const speciesResponse = await fetch(pokemon.species.url);
            const speciesData = await speciesResponse.json();
            
            // Busca todas as variedades
            const varieties = speciesData.varieties;
            
            for (const variety of varieties) {
                if (variety.is_default) continue; // Pula a forma padrão
                
                try {
                    const formResponse = await fetch(variety.pokemon.url);
                    const formData = await formResponse.json();
                    
                    if (formData && formData.sprites) {
                        allSpecialForms.push(formData);
                    }
                } catch (error) {
                    console.error(`Erro ao carregar forma ${variety.pokemon.name}:`, error);
                }
            }
        } catch (error) {
            console.error(`Erro ao carregar Pokémon ${pokemonId}:`, error);
        }
    }
    
    console.log(`${allSpecialForms.length} formas especiais carregadas!`);
}

// Função para exibir os Pokémon
function displayPokemon(pokemonList) {
    pokedexContainer.innerHTML = '';
    
    pokemonList.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        
        // Só adiciona o card se ele foi criado (não null)
        if (card) {
            pokedexContainer.appendChild(card);
        }
    });
    
    // Mostra mensagem se não houver resultados
    if (pokedexContainer.children.length === 0) {
        pokedexContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: white; font-size: 1.2em; padding: 40px;">Nenhum Pokémon encontrado com os filtros selecionados.</div>';
    }
}

// Função para criar um card de Pokémon
function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    
    // Pega o tipo principal para cor do card
    const primaryType = pokemon.types[0].type.name;
    card.querySelector = card.querySelector || function() {};
    
    // Formata o ID com zeros à esquerda
    const pokemonId = String(pokemon.id).padStart(3, '0');
    
    // Escolhe imagem normal ou shiny baseado no modo
    let imageUrl;
    if (isShinyMode) {
        // Verifica se tem sprite shiny disponível
        const shinyUrl = pokemon.sprites.other['official-artwork']?.front_shiny || 
                        pokemon.sprites.front_shiny;
        
        if (!shinyUrl) {
            // Se não tem shiny, retorna null para não criar o card
            return null;
        }
        
        imageUrl = shinyUrl;
    } else {
        imageUrl = pokemon.sprites.other['official-artwork']?.front_default || 
                   pokemon.sprites.front_default;
    }
    
    // Se não tem imagem, não cria o card
    if (!imageUrl) {
        return null;
    }
    
    // Cria os badges de tipo
    const typesHTML = pokemon.types
        .map(typeInfo => {
            const typeName = typeInfo.type.name;
            const typeNamePT = typeTranslations[typeName] || typeName;
            return `<span class="type-badge type-${typeName}">${typeNamePT}</span>`;
        })
        .join('');
    
    card.innerHTML = `
        <div class="pokemon-id">#${pokemonId}</div>
        <img src="${imageUrl}" alt="${pokemon.name}" class="pokemon-image">
        <h2 class="pokemon-name">${pokemon.name}</h2>
        <div class="pokemon-types">
            ${typesHTML}
        </div>
    `;
    
    // Adiciona cor de fundo baseada no tipo
    card.style.background = getTypeGradient(primaryType);
    
    // Adiciona evento de clique para abrir o modal
    card.addEventListener('click', () => openPokemonModal(pokemon));
    
    return card;
}

// Função para obter gradiente baseado no tipo
function getTypeGradient(type) {
    const gradients = {
        normal: 'linear-gradient(135deg, #A8A878 0%, #8a8a5a 100%)',
        fire: 'linear-gradient(135deg, #F08030 0%, #d06820 100%)',
        water: 'linear-gradient(135deg, #6890F0 0%, #4070d0 100%)',
        grass: 'linear-gradient(135deg, #78C850 0%, #58a830 100%)',
        electric: 'linear-gradient(135deg, #F8D030 0%, #d8b010 100%)',
        ice: 'linear-gradient(135deg, #98D8D8 0%, #78b8b8 100%)',
        fighting: 'linear-gradient(135deg, #C03028 0%, #a01018 100%)',
        poison: 'linear-gradient(135deg, #A040A0 0%, #802080 100%)',
        ground: 'linear-gradient(135deg, #E0C068 0%, #c0a048 100%)',
        flying: 'linear-gradient(135deg, #A890F0 0%, #8870d0 100%)',
        psychic: 'linear-gradient(135deg, #F85888 0%, #d83868 100%)',
        bug: 'linear-gradient(135deg, #A8B820 0%, #889800 100%)',
        rock: 'linear-gradient(135deg, #B8A038 0%, #988018 100%)',
        ghost: 'linear-gradient(135deg, #705898 0%, #503878 100%)',
        dragon: 'linear-gradient(135deg, #7038F8 0%, #5018d8 100%)',
        dark: 'linear-gradient(135deg, #705848 0%, #503828 100%)',
        steel: 'linear-gradient(135deg, #B8B8D0 0%, #9898b0 100%)',
        fairy: 'linear-gradient(135deg, #EE99AC 0%, #ce798c 100%)'
    };
    
    return gradients[type] || gradients.normal;
}

// Função de busca
function filterPokemon() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;
    const selectedGeneration = generationFilter.value;
    
    // Decide qual lista usar baseado nos filtros especiais
    let baseList = allPokemon;
    
    if (isMegaFilter || isGmaxFilter || isFusionFilter) {
        // Filtra formas especiais
        baseList = allSpecialForms.filter(form => {
            const formName = form.name.toLowerCase();
            
            if (isMegaFilter) {
                // Mega evoluções e formas primais
                return formName.includes('mega') || formName.includes('primal');
            } else if (isGmaxFilter) {
                // Gigantamax
                return formName.includes('gmax');
            } else if (isFusionFilter) {
                // Fusões e formas alternativas especiais
                const isFusion = formName.includes('black') || formName.includes('white') || 
                                formName.includes('dusk') || formName.includes('dawn') ||
                                formName.includes('crowned') || formName.includes('eternamax') ||
                                formName.includes('origin') || formName.includes('sky') ||
                                formName.includes('blade') || formName.includes('therian') ||
                                formName.includes('resolute') || formName.includes('pirouette') ||
                                formName.includes('aria') || formName.includes('step') ||
                                formName.includes('10-percent') || formName.includes('complete') ||
                                formName.includes('school') || formName.includes('meteor') ||
                                formName.includes('dusk-mane') || formName.includes('dawn-wings') ||
                                formName.includes('ultra') || formName.includes('hangry') ||
                                formName.includes('low-key') || formName.includes('ice') ||
                                formName.includes('shadow') || formName.includes('rider') ||
                                formName.includes('single-strike') || formName.includes('rapid-strike') ||
                                formName.includes('hero') || formName.includes('roaming') ||
                                formName.includes('bloodmoon') || formName.includes('wellspring') ||
                                formName.includes('hearthflame') || formName.includes('cornerstone') ||
                                formName.includes('teal') || formName.includes('mask');
                
                // Exclui mega e gmax
                const isNotMegaOrGmax = !formName.includes('mega') && 
                                       !formName.includes('gmax') && 
                                       !formName.includes('primal');
                
                return isFusion && isNotMegaOrGmax;
            }
            
            return false;
        });
    }
    
    filteredPokemon = baseList.filter(pokemon => {
        // Filtro de busca por nome ou ID
        const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm) ||
                            String(pokemon.id).includes(searchTerm);
        
        // Filtro de tipo
        const matchesType = !selectedType || 
                          pokemon.types.some(typeInfo => typeInfo.type.name === selectedType);
        
        // Filtro de geração
        let matchesGeneration = true;
        if (selectedGeneration !== 'all') {
            const range = generationRanges[selectedGeneration];
            
            // Para formas especiais (Mega, Gmax, Fusões), verifica o ID base
            if (isMegaFilter || isGmaxFilter || isFusionFilter) {
                // Extrai o número base do nome do Pokémon
                // Ex: "charizard-mega-x" -> busca por charizard (ID 6)
                const baseName = pokemon.name.split('-')[0];
                
                // Encontra o Pokémon base na lista original
                const basePokemon = allPokemon.find(p => p.name === baseName);
                
                if (basePokemon) {
                    matchesGeneration = basePokemon.id >= range.start && basePokemon.id <= range.end;
                } else {
                    // Se não encontrar o base, tenta pelo ID do próprio pokémon
                    // Alguns podem ter IDs dentro do range
                    matchesGeneration = pokemon.id >= range.start && pokemon.id <= range.end;
                }
            } else {
                // Para Pokémon normais, usa o ID direto
                matchesGeneration = pokemon.id >= range.start && pokemon.id <= range.end;
            }
        }
        
        return matchesSearch && matchesType && matchesGeneration;
    });
    
    displayPokemon(filteredPokemon);
}

// Event Listeners
searchInput.addEventListener('input', filterPokemon);
typeFilter.addEventListener('change', filterPokemon);
generationFilter.addEventListener('change', filterPokemon);

// Event Listeners dos filtros especiais
shinyFilterBtn.addEventListener('click', toggleShinyFilter);
megaFilterBtn.addEventListener('click', toggleMegaFilter);
gmaxFilterBtn.addEventListener('click', toggleGmaxFilter);
fusionFilterBtn.addEventListener('click', toggleFusionFilter);

// Função para alternar filtro Shiny
function toggleShinyFilter() {
    isShinyMode = !isShinyMode;
    shinyFilterBtn.setAttribute('data-active', isShinyMode);
    
    // Reaplica os filtros
    filterPokemon();
}

// Função para alternar filtro Mega/Primal
function toggleMegaFilter() {
    isMegaFilter = !isMegaFilter;
    megaFilterBtn.setAttribute('data-active', isMegaFilter);
    
    // Desativa outros filtros de forma
    if (isMegaFilter) {
        isGmaxFilter = false;
        isFusionFilter = false;
        gmaxFilterBtn.setAttribute('data-active', false);
        fusionFilterBtn.setAttribute('data-active', false);
    }
    
    filterPokemon();
}

// Função para alternar filtro Gigantamax
function toggleGmaxFilter() {
    isGmaxFilter = !isGmaxFilter;
    gmaxFilterBtn.setAttribute('data-active', isGmaxFilter);
    
    // Desativa outros filtros de forma
    if (isGmaxFilter) {
        isMegaFilter = false;
        isFusionFilter = false;
        megaFilterBtn.setAttribute('data-active', false);
        fusionFilterBtn.setAttribute('data-active', false);
    }
    
    filterPokemon();
}

// Função para alternar filtro Fusões
function toggleFusionFilter() {
    isFusionFilter = !isFusionFilter;
    fusionFilterBtn.setAttribute('data-active', isFusionFilter);
    
    // Desativa outros filtros de forma
    if (isFusionFilter) {
        isMegaFilter = false;
        isGmaxFilter = false;
        megaFilterBtn.setAttribute('data-active', false);
        gmaxFilterBtn.setAttribute('data-active', false);
    }
    
    filterPokemon();
}

// Event Listeners do Modal
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Event Listeners das setas de navegação
prevPokemonBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigatePokemon(-1);
});

nextPokemonBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigatePokemon(1);
});

// Navegação com teclado
document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'flex') {
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'ArrowLeft') {
            navigatePokemon(-1);
        } else if (e.key === 'ArrowRight') {
            navigatePokemon(1);
        }
    }
});

// Função para abrir o modal com detalhes do Pokémon
async function openPokemonModal(pokemon) {
    // Encontra o índice do Pokémon na lista filtrada
    currentPokemonIndex = filteredPokemon.findIndex(p => p.id === pokemon.id);
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    await loadPokemonDetails(pokemon);
}

// Função para carregar os detalhes do Pokémon
async function loadPokemonDetails(pokemon) {
    // Salva dados do Pokémon atual
    currentPokemonData = pokemon;
    isShinyActive = false;
    
    // Preenche informações básicas
    const pokemonId = String(pokemon.id).padStart(3, '0');
    const imageUrl = pokemon.sprites.other['official-artwork'].front_default || 
                     pokemon.sprites.front_default;
    
    modalPokemonImage.src = imageUrl;
    modalPokemonImage.alt = pokemon.name;
    modalPokemonName.innerHTML = `${pokemon.name} <span class="pokemon-number">- #${pokemonId}</span>`;
    
    // Preenche tipos
    const typesHTML = pokemon.types
        .map(typeInfo => {
            const typeName = typeInfo.type.name;
            const typeNamePT = typeTranslations[typeName] || typeName;
            return `<span class="type-badge type-${typeName}">${typeNamePT}</span>`;
        })
        .join('');
    modalPokemonTypes.innerHTML = typesHTML;
    
    // Calcula e exibe fraquezas
    displayWeaknesses(pokemon.types);
    
    // Exibe estatísticas
    displayStats(pokemon.stats);
    
    // Busca e exibe linha evolutiva
    await displayEvolutionChain(pokemon.species.url);
    
    // Busca e exibe formas alternativas
    await displayAlternateForms(pokemon);
    
    // Configura versão Shiny
    setupShinyVersion(pokemon);
}

// Função para fechar o modal
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Função para exibir fraquezas
function displayWeaknesses(types) {
    const weaknessSet = new Set();
    
    types.forEach(typeInfo => {
        const typeName = typeInfo.type.name;
        if (typeWeaknesses[typeName]) {
            typeWeaknesses[typeName].forEach(weakness => {
                weaknessSet.add(weakness);
            });
        }
    });
    
    if (weaknessSet.size === 0) {
        modalPokemonWeaknesses.innerHTML = '<p style="color: #95a5a6;">Nenhuma fraqueza específica</p>';
        return;
    }
    
    const weaknessesHTML = Array.from(weaknessSet)
        .map(weakness => {
            const weaknessNamePT = typeTranslations[weakness] || weakness;
            return `<span class="type-badge type-${weakness}">${weaknessNamePT}</span>`;
        })
        .join('');
    
    modalPokemonWeaknesses.innerHTML = weaknessesHTML;
}

// Função para exibir estatísticas
function displayStats(stats) {
    const statNames = {
        hp: 'HP',
        attack: 'Ataque',
        defense: 'Defesa',
        'special-attack': 'At. Especial',
        'special-defense': 'Def. Especial',
        speed: 'Velocidade'
    };
    
    const statsHTML = stats.map(stat => {
        const statName = statNames[stat.stat.name] || stat.stat.name;
        const statValue = stat.base_stat;
        const percentage = (statValue / 255) * 100;
        
        // Define cor baseada no valor
        let color = '#4CAF50';
        if (statValue < 50) color = '#f44336';
        else if (statValue < 80) color = '#FF9800';
        else if (statValue < 120) color = '#2196F3';
        
        return `
            <div class="stat-bar">
                <span class="stat-name">${statName}</span>
                <span class="stat-value">${statValue}</span>
                <div class="stat-bar-container">
                    <div class="stat-bar-fill" style="width: ${percentage}%; background: ${color};"></div>
                </div>
            </div>
        `;
    }).join('');
    
    modalPokemonStats.innerHTML = statsHTML;
}

// Função para buscar e exibir a cadeia evolutiva
async function displayEvolutionChain(speciesUrl) {
    modalEvolutionChain.innerHTML = '<div class="loading-evolution">Carregando evolução...</div>';
    
    try {
        // Busca informações da espécie
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();
        
        // Busca a cadeia evolutiva
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();
        
        // Processa a cadeia evolutiva
        const evolutionChain = [];
        let currentEvolution = evolutionData.chain;
        
        while (currentEvolution) {
            const pokemonName = currentEvolution.species.name;
            const pokemonId = currentEvolution.species.url.split('/').filter(Boolean).pop();
            
            evolutionChain.push({
                name: pokemonName,
                id: pokemonId
            });
            
            currentEvolution = currentEvolution.evolves_to[0];
        }
        
        // Exibe a cadeia evolutiva
        if (evolutionChain.length === 1) {
            modalEvolutionChain.innerHTML = '<p style="color: #95a5a6; text-align: center;">Este Pokémon não possui evolução</p>';
        } else {
            const evolutionHTML = evolutionChain.map((evolution, index) => {
                const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evolution.id}.png`;
                
                return `
                    ${index > 0 ? '<span class="evolution-arrow">→</span>' : ''}
                    <div class="evolution-item" onclick="openPokemonById(${evolution.id})">
                        <img src="${imageUrl}" alt="${evolution.name}" class="evolution-image">
                        <span class="evolution-name">${evolution.name}</span>
                    </div>
                `;
            }).join('');
            
            modalEvolutionChain.innerHTML = evolutionHTML;
        }
    } catch (error) {
        console.error('Erro ao carregar cadeia evolutiva:', error);
        modalEvolutionChain.innerHTML = '<p style="color: #f44336; text-align: center;">Erro ao carregar evolução</p>';
    }
}

// Função para navegar entre Pokémon
function navigatePokemon(direction) {
    currentPokemonIndex += direction;
    
    // Loop circular
    if (currentPokemonIndex < 0) {
        currentPokemonIndex = filteredPokemon.length - 1;
    } else if (currentPokemonIndex >= filteredPokemon.length) {
        currentPokemonIndex = 0;
    }
    
    const pokemon = filteredPokemon[currentPokemonIndex];
    loadPokemonDetails(pokemon);
}

// Função para abrir modal de um Pokémon pelo ID
async function openPokemonById(id) {
    const pokemon = allPokemon.find(p => p.id === parseInt(id));
    if (pokemon) {
        openPokemonModal(pokemon);
    } else {
        // Se não estiver carregado, busca da API
        const newPokemon = await fetchPokemon(id);
        if (newPokemon) {
            openPokemonModal(newPokemon);
        }
    }
}

// Função para buscar e exibir formas alternativas
async function displayAlternateForms(pokemon) {
    try {
        // Busca informações da espécie
        const speciesResponse = await fetch(pokemon.species.url);
        const speciesData = await speciesResponse.json();
        
        // Busca todas as variedades
        const varieties = speciesData.varieties;
        
        // Filtra apenas as formas alternativas (não a forma base)
        const alternateForms = varieties.filter(variety => !variety.is_default);
        
        if (alternateForms.length === 0) {
            alternateFormsSection.style.display = 'none';
            return;
        }
        
        alternateFormsSection.style.display = 'block';
        modalAlternateForms.innerHTML = '<div class="loading-evolution">Carregando formas...</div>';
        
        // Busca dados de cada forma alternativa
        const formsData = await Promise.all(
            alternateForms.map(async (variety) => {
                try {
                    const response = await fetch(variety.pokemon.url);
                    return await response.json();
                } catch (error) {
                    console.error('Erro ao buscar forma:', error);
                    return null;
                }
            })
        );
        
        // Filtra formas nulas
        const validForms = formsData.filter(form => form !== null);
        
        if (validForms.length === 0) {
            alternateFormsSection.style.display = 'none';
            return;
        }
        
        // Cria cards para cada forma
        const formsHTML = validForms.map(form => {
            const imageUrl = form.sprites.other['official-artwork']?.front_default || 
                           form.sprites.front_default ||
                           'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
            
            // Identifica o tipo de forma
            const formType = identifyFormType(form.name);
            const formName = formatFormName(form.name);
            
            return `
                <div class="alternate-form-card" onclick="loadAlternateForm(${form.id})">
                    <img src="${imageUrl}" alt="${form.name}" class="alternate-form-image">
                    <div class="alternate-form-name">${formName}</div>
                    <span class="form-badge ${formType.class}">${formType.label}</span>
                </div>
            `;
        }).join('');
        
        modalAlternateForms.innerHTML = formsHTML;
        
    } catch (error) {
        console.error('Erro ao carregar formas alternativas:', error);
        alternateFormsSection.style.display = 'none';
    }
}

// Função para identificar o tipo de forma
function identifyFormType(formName) {
    const name = formName.toLowerCase();
    
    if (name.includes('mega')) {
        return { class: 'mega', label: 'Mega' };
    } else if (name.includes('gmax') || name.includes('gigantamax')) {
        return { class: 'gmax', label: 'Gigamax' };
    } else if (name.includes('primal')) {
        return { class: 'primal', label: 'Primal' };
    } else if (name.includes('alola')) {
        return { class: 'alola', label: 'Alola' };
    } else if (name.includes('galar')) {
        return { class: 'galar', label: 'Galar' };
    } else if (name.includes('hisui')) {
        return { class: 'hisui', label: 'Hisui' };
    } else if (name.includes('paldea')) {
        return { class: 'paldea', label: 'Paldea' };
    } else {
        return { class: 'other', label: 'Forma Alt.' };
    }
}

// Função para formatar o nome da forma
function formatFormName(formName) {
    // Remove o nome base do Pokémon e mantém apenas a variação
    let name = formName.split('-').slice(1).join(' ');
    
    // Substitui termos comuns
    name = name.replace('mega', 'Mega')
               .replace('gmax', 'Gigantamax')
               .replace('primal', 'Primal')
               .replace('alola', 'Alola')
               .replace('galar', 'Galar')
               .replace('hisui', 'Hisui')
               .replace('paldea', 'Paldea');
    
    // Se ficou vazio, retorna o nome completo
    if (!name.trim()) {
        name = formName;
    }
    
    return name.charAt(0).toUpperCase() + name.slice(1);
}

// Função para configurar a versão Shiny
function setupShinyVersion(pokemon) {
    const shinyImageUrl = pokemon.sprites.other['official-artwork']?.front_shiny || 
                         pokemon.sprites.front_shiny;
    
    if (shinyImageUrl) {
        // Atualiza a imagem do card Shiny com o Shiny do Pokémon ATUAL
        const shinyImageElement = document.getElementById('shinyImage');
        shinyImageElement.src = shinyImageUrl;
        shinyImageElement.alt = `${pokemon.name} Shiny`;
        
        // Reseta o estado do card para normal
        const shinyCardElement = document.getElementById('shinyCard');
        shinyCardElement.classList.remove('active');
        
        const labelElement = shinyCardElement.querySelector('.shiny-label');
        labelElement.textContent = 'Clique para ver o Shiny';
        
        // Remove todos os listeners anteriores clonando o elemento
        const newShinyCard = shinyCardElement.cloneNode(true);
        shinyCardElement.parentNode.replaceChild(newShinyCard, shinyCardElement);
        
        // Adiciona novo listener com os dados corretos do Pokémon atual
        document.getElementById('shinyCard').addEventListener('click', function() {
            toggleShiny(currentPokemonData);
        });
    }
}

// Função para alternar entre normal e shiny
function toggleShiny(pokemon) {
    const shinyCardElement = document.getElementById('shinyCard');
    const labelElement = shinyCardElement.querySelector('.shiny-label');
    
    isShinyActive = !isShinyActive;
    
    if (isShinyActive) {
        // Mostra versão Shiny do Pokémon ATUAL
        const shinyImageUrl = currentPokemonData.sprites.other['official-artwork']?.front_shiny || 
                             currentPokemonData.sprites.front_shiny;
        
        if (shinyImageUrl) {
            modalPokemonImage.src = shinyImageUrl;
            shinyCardElement.classList.add('active');
            labelElement.textContent = 'Voltar para Normal';
        }
    } else {
        // Mostra versão normal do Pokémon ATUAL
        const normalImageUrl = currentPokemonData.sprites.other['official-artwork']?.front_default || 
                              currentPokemonData.sprites.front_default;
        
        modalPokemonImage.src = normalImageUrl;
        shinyCardElement.classList.remove('active');
        labelElement.textContent = 'Clique para ver o Shiny';
    }
}

// Função para carregar uma forma alternativa
async function loadAlternateForm(pokemonId) {
    const formPokemon = await fetchPokemon(pokemonId);
    if (formPokemon) {
        loadPokemonDetails(formPokemon);
    }
}

// Inicializa a Pokédex
loadAllPokemon();

// ============================================
// MODAL DE DISCLAIMER
// ============================================

const disclaimerModal = document.getElementById('disclaimerModal');
const closeDisclaimerBtn = document.getElementById('closeDisclaimer');
const langButtons = document.querySelectorAll('.lang-btn');

// Mostra o modal ao carregar a página
window.addEventListener('load', () => {
    // Verifica se o usuário já aceitou o disclaimer
    const disclaimerAccepted = localStorage.getItem('disclaimerAccepted');
    
    if (!disclaimerAccepted) {
        disclaimerModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
});

// Fecha o modal
closeDisclaimerBtn.addEventListener('click', () => {
    disclaimerModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Salva que o usuário aceitou o disclaimer
    localStorage.setItem('disclaimerAccepted', 'true');
});

// Troca de idioma
langButtons.forEach(button => {
    button.addEventListener('click', () => {
        const selectedLang = button.getAttribute('data-lang');
        
        // Remove active de todos os botões
        langButtons.forEach(btn => btn.classList.remove('active'));
        
        // Adiciona active no botão clicado
        button.classList.add('active');
        
        // Esconde todo o conteúdo
        document.querySelectorAll('.lang-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Mostra o conteúdo do idioma selecionado
        document.querySelector(`.lang-content[data-lang="${selectedLang}"]`).classList.add('active');
    });
});
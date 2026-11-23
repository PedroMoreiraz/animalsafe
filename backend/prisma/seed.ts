
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não foi configurada.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const instituicoes = [
  {
    nome: "IBAMA",
    categoria: "Fiscalização e denúncias ambientais",
    descricao:
      "Recebe denúncias e manifestações relacionadas a questões ambientais. Pode orientar sobre situações envolvendo fauna silvestre e crimes ambientais.",
    abrangencia: "Nacional",
    uf: null,
    telefone: "0800 061 8080",
    email: null,
    endereco:
      "SCEN Trecho 2, Edifício Sede, Brasília - DF, CEP 70818-900",
    site: "https://www.gov.br/ibama/pt-br/canais_atendimento/fale-conosco",
    cnpj: null,
  },
  {
    nome: "ICMBio",
    categoria: "Conservação da biodiversidade",
    descricao:
      "Atende demandas relacionadas à conservação da biodiversidade e às unidades de conservação federais. Para ocorrências dentro dessas unidades, recebe denúncias e manifestações pela Ouvidoria.",
    abrangencia: "Nacional",
    uf: null,
    telefone: "(61) 2028-9110 / (61) 2028-9153 / (61) 2028-9580",
    email: "ouvidoria@icmbio.gov.br",
    endereco:
      "EQSW 103/104, Complexo Administrativo, Bloco B, Térreo, Setor Sudoeste, Brasília - DF, CEP 70670-350",
    site: "https://www.gov.br/icmbio/pt-br",
    cnpj: null,
  },

  // ACRE
  {
    nome: "Instituto de Meio Ambiente do Acre (IMAC)",
    categoria: "Órgão ambiental estadual",
    descricao: "Órgão responsável pela gestão e fiscalização ambiental no estado do Acre.",
    abrangencia: "Estadual",
    uf: "AC",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://imac.ac.gov.br/",
    cnpj: null,
  },

  // ALAGOAS
  {
    nome: "Instituto do Meio Ambiente de Alagoas (IMA)",
    categoria: "Órgão ambiental estadual",
    descricao: "Atua na proteção, fiscalização e gestão ambiental em Alagoas.",
    abrangencia: "Estadual",
    uf: "AL",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.ima.al.gov.br/",
    cnpj: null,
  },

  // AMAPÁ
  {
    nome: "Secretaria de Estado do Meio Ambiente (SEMA)",
    categoria: "Órgão ambiental estadual",
    descricao: "Órgão responsável pela gestão ambiental no estado do Amapá.",
    abrangencia: "Estadual",
    uf: "AP",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://sema.portal.ap.gov.br/",
    cnpj: null,
  },

  // AMAZONAS
  {
    nome: "Instituto de Proteção Ambiental do Amazonas (IPAAM)",
    categoria: "Órgão ambiental estadual",
    descricao: "Atua na fiscalização e proteção ambiental no estado do Amazonas.",
    abrangencia: "Estadual",
    uf: "AM",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.ipaam.am.gov.br/",
    cnpj: null,
  },

  // BAHIA
  {
    nome: "Instituto do Meio Ambiente e Recursos Hídricos (INEMA)",
    categoria: "Órgão ambiental estadual",
    descricao: "Responsável pela execução das políticas ambientais e de recursos hídricos na Bahia.",
    abrangencia: "Estadual",
    uf: "BA",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.inema.ba.gov.br/",
    cnpj: null,
  },

  // CEARÁ
  {
    nome: "Superintendência Estadual do Meio Ambiente (SEMACE)",
    categoria: "Órgão ambiental estadual",
    descricao: "Atua no controle, fiscalização e proteção ambiental no Ceará.",
    abrangencia: "Estadual",
    uf: "CE",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.semace.ce.gov.br/",
    cnpj: null,
  },

  // DISTRITO FEDERAL
  {
    nome: "Instituto Brasília Ambiental (IBRAM)",
    categoria: "Órgão ambiental estadual",
    descricao: "Responsável pela execução das políticas ambientais e fiscalização ambiental no Distrito Federal.",
    abrangencia: "Estadual",
    uf: "DF",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.brasiliaambiental.df.gov.br/",
    cnpj: null,
  },

  // ESPÍRITO SANTO
  {
    nome: "Instituto Estadual de Meio Ambiente e Recursos Hídricos (IEMA)",
    categoria: "Órgão ambiental estadual",
    descricao: "Atua na gestão e fiscalização ambiental no Espírito Santo.",
    abrangencia: "Estadual",
    uf: "ES",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://iema.es.gov.br/",
    cnpj: null,
  },

  // GOIÁS
  {
    nome: "Secretaria de Estado de Meio Ambiente e Desenvolvimento Sustentável (SEMAD)",
    categoria: "Órgão ambiental estadual",
    descricao: "Responsável pela gestão e execução das políticas ambientais em Goiás.",
    abrangencia: "Estadual",
    uf: "GO",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://goias.gov.br/meioambiente/",
    cnpj: null,
  },

  // MARANHÃO
  {
    nome: "Secretaria de Estado do Meio Ambiente e Recursos Naturais (SEMA)",
    categoria: "Órgão ambiental estadual",
    descricao: "Atua na gestão, proteção e fiscalização ambiental no Maranhão.",
    abrangencia: "Estadual",
    uf: "MA",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.sema.ma.gov.br/",
    cnpj: null,
  },

  // MATO GROSSO
  {
    nome: "Secretaria de Estado de Meio Ambiente (SEMA)",
    categoria: "Órgão ambiental estadual",
    descricao: "Responsável pela política ambiental e fiscalização no Mato Grosso.",
    abrangencia: "Estadual",
    uf: "MT",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.sema.mt.gov.br/",
    cnpj: null,
  },

  // MATO GROSSO DO SUL
  {
    nome: "Instituto de Meio Ambiente de Mato Grosso do Sul (IMASUL)",
    categoria: "Órgão ambiental estadual",
    descricao: "Atua na proteção, gestão e fiscalização ambiental em Mato Grosso do Sul.",
    abrangencia: "Estadual",
    uf: "MS",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.imasul.ms.gov.br/",
    cnpj: null,
  },

  // MINAS GERAIS
  {
    nome: "Secretaria de Estado de Meio Ambiente e Desenvolvimento Sustentável (SEMAD)",
    categoria: "Órgão ambiental estadual",
    descricao: "Responsável pela coordenação das políticas ambientais em Minas Gerais.",
    abrangencia: "Estadual",
    uf: "MG",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.meioambiente.mg.gov.br/",
    cnpj: null,
  },

  // PARÁ
  {
    nome: "Secretaria de Estado de Meio Ambiente e Sustentabilidade (SEMAS)",
    categoria: "Órgão ambiental estadual",
    descricao: "Atua na gestão e fiscalização ambiental no estado do Pará.",
    abrangencia: "Estadual",
    uf: "PA",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.semas.pa.gov.br/",
    cnpj: null,
  },

  // PARAÍBA
  {
    nome: "Superintendência de Administração do Meio Ambiente (SUDEMA)",
    categoria: "Órgão ambiental estadual",
    descricao: "Responsável pela execução e fiscalização da política ambiental na Paraíba.",
    abrangencia: "Estadual",
    uf: "PB",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://sudema.pb.gov.br/",
    cnpj: null,
  },

  // PARANÁ
  {
    nome: "Instituto Água e Terra (IAT)",
    categoria: "Órgão ambiental estadual",
    descricao: "Atua na gestão ambiental, conservação da biodiversidade e recursos naturais no Paraná.",
    abrangencia: "Estadual",
    uf: "PR",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.iat.pr.gov.br/",
    cnpj: null,
  },

  // PERNAMBUCO
  {
    nome: "Agência Estadual de Meio Ambiente (CPRH)",
    categoria: "Órgão ambiental estadual",
    descricao: "Responsável pelo controle e fiscalização ambiental em Pernambuco.",
    abrangencia: "Estadual",
    uf: "PE",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.cprh.pe.gov.br/",
    cnpj: null,
  },

  // PIAUÍ
  {
    nome: "Secretaria de Meio Ambiente e Recursos Hídricos (SEMARH)",
    categoria: "Órgão ambiental estadual",
    descricao: "Responsável pela gestão ambiental e dos recursos naturais no Piauí.",
    abrangencia: "Estadual",
    uf: "PI",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.semar.pi.gov.br/",
    cnpj: null,
  },

  // RIO DE JANEIRO
  {
    nome: "Instituto Estadual do Ambiente (INEA)",
    categoria: "Órgão ambiental estadual",
    descricao: "Atua na proteção ambiental, fiscalização e gestão dos recursos naturais no Rio de Janeiro.",
    abrangencia: "Estadual",
    uf: "RJ",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.inea.rj.gov.br/",
    cnpj: null,
  },

  // RIO GRANDE DO NORTE
  {
    nome: "Instituto de Desenvolvimento Sustentável e Meio Ambiente (IDEMA)",
    categoria: "Órgão ambiental estadual",
    descricao: "Responsável pela gestão e fiscalização ambiental no Rio Grande do Norte.",
    abrangencia: "Estadual",
    uf: "RN",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.idema.rn.gov.br/",
    cnpj: null,
  },

  // RIO GRANDE DO SUL
  {
    nome: "Fundação Estadual de Proteção Ambiental (FEPAM)",
    categoria: "Órgão ambiental estadual",
    descricao: "Atua no controle e proteção ambiental no Rio Grande do Sul.",
    abrangencia: "Estadual",
    uf: "RS",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.fepam.rs.gov.br/",
    cnpj: null,
  },

  // RONDÔNIA
  {
    nome: "Secretaria de Estado do Desenvolvimento Ambiental (SEDAM)",
    categoria: "Órgão ambiental estadual",
    descricao: "Responsável pela gestão e fiscalização ambiental em Rondônia.",
    abrangencia: "Estadual",
    uf: "RO",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.sedam.ro.gov.br/",
    cnpj: null,
  },

  // RORAIMA
  {
    nome: "Fundação Estadual do Meio Ambiente e Recursos Hídricos (FEMARH)",
    categoria: "Órgão ambiental estadual",
    descricao: "Atua na proteção ambiental e gestão dos recursos naturais em Roraima.",
    abrangencia: "Estadual",
    uf: "RR",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.femarh.rr.gov.br/",
    cnpj: null,
  },

  // SANTA CATARINA
  {
    nome: "Instituto do Meio Ambiente de Santa Catarina (IMA)",
    categoria: "Órgão ambiental estadual",
    descricao: "Responsável pela gestão e fiscalização ambiental em Santa Catarina.",
    abrangencia: "Estadual",
    uf: "SC",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.ima.sc.gov.br/",
    cnpj: null,
  },

  // SÃO PAULO
  {
    nome: "Companhia Ambiental do Estado de São Paulo (CETESB)",
    categoria: "Órgão ambiental estadual",
    descricao: "Atua no controle, fiscalização e proteção ambiental no estado de São Paulo.",
    abrangencia: "Estadual",
    uf: "SP",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://cetesb.sp.gov.br/",
    cnpj: null,
  },

  // SERGIPE
  {
    nome: "Administração Estadual do Meio Ambiente (ADEMA)",
    categoria: "Órgão ambiental estadual",
    descricao: "Responsável pela execução e fiscalização da política ambiental em Sergipe.",
    abrangencia: "Estadual",
    uf: "SE",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://adema.se.gov.br/",
    cnpj: null,
  },

  // TOCANTINS
  {
    nome: "Instituto Natureza do Tocantins (NATURATINS)",
    categoria: "Órgão ambiental estadual",
    descricao: "Atua na proteção da biodiversidade e fiscalização ambiental no Tocantins.",
    abrangencia: "Estadual",
    uf: "TO",
    telefone: null,
    email: null,
    endereco: null,
    site: "https://www.to.gov.br/naturatins",
    cnpj: null,
  },
];


const guias = [
  {
    titulo: "Animal silvestre encontrado saudável",
    descricao:
      "Orientações para quando um animal silvestre é encontrado em ambiente urbano ou fora do local onde normalmente é observado, sem sinais aparentes de ferimentos.",
    situacao: "Animal silvestre saudável",
    grupo_animal: "Silvestre",
    nivel_risco: "Baixo",
    o_que_fazer: [
      "Mantenha uma distância segura e observe o animal sem tentar se aproximar.",
      "Permita que o animal siga seu caminho naturalmente, se não houver risco imediato.",
      "Afaste cães, gatos e outras pessoas do local.",
      "Observe se existem sinais visíveis de ferimentos ou dificuldade de locomoção.",
      "Registre a localização para facilitar a identificação do local, caso seja necessário pedir ajuda."
    ],
    o_que_evitar: [
      "Não tente capturar ou perseguir o animal.",
      "Não ofereça alimentos ou água.",
      "Não tente domesticar ou manter o animal em cativeiro.",
      "Não provoque barulhos ou movimentos para fazê-lo sair do local."
    ],
    quando_pedir_ajuda:
      "Procure orientação do órgão ambiental responsável da região se o animal estiver em situação de risco, apresentar comportamento anormal ou permanecer em um local onde possa sofrer acidentes.",
    fonte: "Brasília Ambiental - Perguntas e respostas sobre animais em ambientes urbanos",
    url_fonte:
      "https://www.ibram.df.gov.br/perguntas-e-respostas-mais-comuns-sobre-animais-encontrados-em-ambientes-urbanos",
    ativo: true
  },
  {
    titulo: "Animal silvestre ferido ou debilitado",
    descricao:
      "Orientações para situações em que um animal silvestre apresenta ferimentos, fraqueza, dificuldade de locomoção ou sinais aparentes de doença.",
    situacao: "Animal silvestre ferido ou debilitado",
    grupo_animal: "Silvestre",
    nivel_risco: "Alto",
    o_que_fazer: [
      "Mantenha distância e evite qualquer contato direto com o animal.",
      "Observe os sinais aparentes de ferimentos sem manipular o animal.",
      "Registre a localização exata e, se for seguro, faça uma fotografia à distância.",
      "Entre em contato com a Polícia Ambiental, Corpo de Bombeiros ou órgão ambiental responsável pela região.",
      "Siga as orientações da equipe especializada até a chegada do atendimento."
    ],
    o_que_evitar: [
      "Não tente tratar ferimentos por conta própria.",
      "Não tente capturar ou transportar o animal sem orientação e autorização adequada.",
      "Não ofereça medicamentos, alimentos ou água.",
      "Não tente alimentar o animal à força.",
      "Não permita que crianças ou animais domésticos se aproximem."
    ],
    quando_pedir_ajuda:
      "Solicite atendimento especializado assim que identificar ferimentos, sangramento, dificuldade de locomoção, debilidade ou suspeita de envenenamento. Se houver risco imediato para pessoas, acione o serviço de emergência competente.",
    fonte: "Polícia Militar Ambiental de Santa Catarina - Perguntas frequentes",
    url_fonte:
      "https://pm.sc.gov.br/ambiental/paginas/faq-perguntas-frequentes",
    ativo: true
  },
  {
    titulo: "Filhote encontrado sozinho",
    descricao:
      "Orientações para quando um filhote de animal silvestre é encontrado fora do ninho ou aparentemente sem a presença dos pais.",
    situacao: "Filhote encontrado sozinho",
    grupo_animal: "Silvestre",
    nivel_risco: "Moderado",
    o_que_fazer: [
      "Observe o filhote à distância antes de qualquer intervenção.",
      "Verifique visualmente se existem ferimentos ou sinais evidentes de debilidade.",
      "Considere que os pais podem estar próximos, mesmo que não estejam visíveis.",
      "Mantenha cães, gatos e pessoas afastados.",
      "Se houver ferimentos ou risco imediato, procure orientação de um órgão especializado."
    ],
    o_que_evitar: [
      "Não retire o filhote do local apenas por parecer abandonado.",
      "Não tente alimentar o animal.",
      "Não ofereça leite ou alimentos inadequados.",
      "Não manipule o filhote sem necessidade.",
      "Não destrua ninhos ou tente remover outros animais do local."
    ],
    quando_pedir_ajuda:
      "Procure atendimento especializado se o filhote estiver ferido, debilitado, em perigo imediato ou se houver evidências de que realmente está órfão. A avaliação deve ser feita considerando a espécie e a situação.",
    fonte: "IBAMA - Orientações de como proceder ao encontrar animais silvestres",
    url_fonte:
      "https://www.gov.br/ibama/pt-br/composicao/quem-e-quem/centros/Orientacoes_de_como_proceder_ao_encontrar_animais_silvestres.pdf",
    ativo: true
  },
  {
    titulo: "Animal silvestre dentro de uma residência",
    descricao:
      "Orientações para quando um animal silvestre entra em uma casa, quintal, garagem ou outro espaço ocupado por pessoas.",
    situacao: "Animal silvestre dentro de residência",
    grupo_animal: "Silvestre",
    nivel_risco: "Alto",
    o_que_fazer: [
      "Mantenha distância e evite encurralar o animal.",
      "Afaste crianças, visitantes e animais domésticos.",
      "Se for possível sem se aproximar do animal, mantenha uma rota de saída livre para o ambiente externo.",
      "Evite movimentações bruscas e mantenha o ambiente tranquilo.",
      "Entre em contato com a Polícia Ambiental ou Corpo de Bombeiros para receber orientação."
    ],
    o_que_evitar: [
      "Não tente capturar ou segurar o animal.",
      "Não tente espantá-lo com objetos ou água.",
      "Não provoque o animal nem tente fotografá-lo de perto.",
      "Não utilize venenos ou armadilhas.",
      "Não tente transportá-lo para outro local."
    ],
    quando_pedir_ajuda:
      "Acione os órgãos competentes quando o animal não conseguir sair sozinho, estiver encurralado, apresentar comportamento agressivo ou representar risco para os moradores. Em caso de animal peçonhento, mantenha distância e procure imediatamente orientação especializada.",
    fonte: "Polícia Militar Ambiental de Santa Catarina - Perguntas frequentes",
    url_fonte:
      "https://pm.sc.gov.br/ambiental/paginas/faq-perguntas-frequentes",
    ativo: true
  },
  {
    titulo: "Animal silvestre em via pública ou situação de risco",
    descricao:
      "Orientações para quando um animal silvestre é encontrado em ruas, rodovias, áreas movimentadas, locais de difícil acesso ou situações que possam provocar acidentes.",
    situacao: "Animal silvestre em situação de risco",
    grupo_animal: "Silvestre",
    nivel_risco: "Alto",
    o_que_fazer: [
      "Mantenha distância e não tente se aproximar do animal.",
      "Observe a situação sem bloquear a passagem ou colocar pessoas em risco.",
      "Registre a localização e referências próximas.",
      "Se for seguro, registre uma fotografia sem se aproximar.",
      "Acione a Polícia Ambiental, o Corpo de Bombeiros ou o órgão responsável pela fauna da região."
    ],
    o_que_evitar: [
      "Não tente retirar o animal da via por conta própria.",
      "Não pare em locais perigosos para realizar o resgate.",
      "Não tente perseguir ou direcionar o animal com objetos.",
      "Não coloque sua vida ou a de outras pessoas em risco.",
      "Não transporte o animal sem orientação especializada."
    ],
    quando_pedir_ajuda:
      "Solicite ajuda imediatamente quando o animal estiver em uma via movimentada, preso, exposto a atropelamento, em contato com instalações perigosas ou quando houver risco para pessoas.",
    fonte: "Secretaria de Estado de Meio Ambiente de Mato Grosso - Orientações sobre animais silvestres em áreas urbanas",
    url_fonte:
      "https://www.secom.mt.gov.br/w/sema-orienta-sobre-como-agir-ao-encontrar-animais-silvestres-em-%C3%A1reas-urbanas.-incid%C3%AAncia-aumenta-com-per%C3%ADodo-de-chuvas",
    ativo: true
  },
  {
    titulo: "Animal doméstico em possível situação de maus-tratos",
    descricao:
      "Orientações para quando cães, gatos ou outros animais domésticos apresentam sinais de abandono, violência, negligência ou condições inadequadas de cuidado.",
    situacao: "Animal doméstico em possível situação de maus-tratos",
    grupo_animal: "Doméstico",
    nivel_risco: "Alto",
    o_que_fazer: [
      "Observe a situação e procure identificar sinais concretos de sofrimento ou negligência.",
      "Registre informações sobre o local, a data e as condições observadas.",
      "Se for seguro e permitido, registre fotografias ou vídeos sem invadir propriedades.",
      "Procure o órgão de proteção animal, a autoridade policial ou o canal oficial de denúncia da sua região.",
      "Em situações de risco imediato à vida do animal, acione as autoridades competentes."
    ],
    o_que_evitar: [
      "Não confronte diretamente a pessoa suspeita de praticar maus-tratos.",
      "Não invada propriedades para tentar retirar o animal.",
      "Não divulgue acusações sem verificar as informações.",
      "Não tente realizar procedimentos veterinários sem capacitação.",
      "Não coloque sua segurança em risco para registrar evidências."
    ],
    quando_pedir_ajuda:
      "Procure as autoridades quando houver indícios de agressão, ferimentos sem atendimento, privação de água ou alimento, abandono ou condições que comprometam o bem-estar do animal. Em situações de perigo imediato, acione o serviço de emergência competente.",
    fonte: "IBAMA - Apresentar denúncia ambiental",
    url_fonte:
      "https://www.gov.br/pt-br/servicos/apresentar-denuncia-ambiental",
    ativo: true
  }
];

async function main() {
  console.log("Iniciando cadastro das instituições...");

  for (const instituicao of instituicoes) {
    await prisma.instituicao.upsert({
      where: {
        nome: instituicao.nome,
      },
      update: instituicao,
      create: instituicao,
    });

    console.log(`Instituição cadastrada: ${instituicao.nome}`);
  }

  console.log("Cadastro das instituições concluído!");

  console.log("Iniciando cadastro dos guias de orientação...");

  for (const guia of guias) {
    const guiaExistente = await prisma.guiaOrientacao.findFirst({
      where: {
        titulo: guia.titulo,
        situacao: guia.situacao,
        grupo_animal: guia.grupo_animal,
      },
      select: {
        id: true,
      },
    });

    if (guiaExistente) {
      await prisma.guiaOrientacao.update({
        where: {
          id: guiaExistente.id,
        },
        data: guia,
      });
    } else {
      await prisma.guiaOrientacao.create({
        data: guia,
      });
    }

    console.log(`Guia cadastrado: ${guia.titulo}`);
  }

  console.log("Cadastro dos guias concluído!");
  console.log("Seed executado com sucesso!");
}

main()
  .catch((error) => {
    console.error("Erro ao cadastrar instituições:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
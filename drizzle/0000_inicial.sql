CREATE TABLE "assinaturas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "assinaturas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"documento_tipo" text NOT NULL,
	"documento_id" integer NOT NULL,
	"token" text NOT NULL,
	"modo" text NOT NULL,
	"status" text DEFAULT 'pendente' NOT NULL,
	"documento_hash" text NOT NULL,
	"assinante_nome" text,
	"assinante_cpf" text,
	"assinatura_imagem" text,
	"ip" text,
	"user_agent" text,
	"assinado_em" timestamp with time zone,
	"expira_em" timestamp with time zone,
	"confirmado_por" integer,
	"criado_por" integer,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assinaturas_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "clientes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nome" text NOT NULL,
	"cpf" text,
	"telefone" text,
	"whatsapp" text,
	"email" text,
	"nascimento" date,
	"cep" text,
	"endereco" text,
	"numero" text,
	"complemento" text,
	"bairro" text,
	"cidade" text,
	"estado" text,
	"origem" text,
	"responsavel_id" integer,
	"observacoes" text,
	"demo" boolean DEFAULT false NOT NULL,
	"criado_por" integer,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "configuracoes" (
	"chave" text PRIMARY KEY NOT NULL,
	"valor" jsonb NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_por" integer
);
--> statement-breakpoint
CREATE TABLE "conversa_notas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "conversa_notas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"conversa_id" integer NOT NULL,
	"usuario_id" integer,
	"conteudo" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "conversas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"canal" text DEFAULT 'whatsapp' NOT NULL,
	"provedor" text NOT NULL,
	"contato_telefone" text NOT NULL,
	"contato_nome" text,
	"cliente_id" integer,
	"negocio_id" integer,
	"responsavel_id" integer,
	"status" text DEFAULT 'nova' NOT NULL,
	"prioridade" text DEFAULT 'normal' NOT NULL,
	"modo" text DEFAULT 'ia' NOT NULL,
	"triagem_ia" jsonb,
	"triagem_em" timestamp with time zone,
	"atendimento_humano_por" integer,
	"atendimento_humano_em" timestamp with time zone,
	"ultima_mensagem_em" timestamp with time zone,
	"ultima_mensagem_texto" text,
	"ultima_mensagem_direcao" text,
	"nao_lidas" integer DEFAULT 0 NOT NULL,
	"externo_id" text,
	"demo" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empresa" (
	"id" integer PRIMARY KEY NOT NULL,
	"nome_fantasia" text NOT NULL,
	"razao_social" text,
	"cnpj" text,
	"telefone" text,
	"whatsapp" text,
	"email" text,
	"instagram" text,
	"endereco" text,
	"cidade" text,
	"estado" text,
	"cep" text,
	"condicoes_venda" text,
	"condicoes_os" text,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_por" integer
);
--> statement-breakpoint
CREATE TABLE "follow_ups" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "follow_ups_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"conversa_id" integer,
	"cliente_id" integer,
	"negocio_id" integer,
	"usuario_id" integer,
	"agendado_para" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'pendente' NOT NULL,
	"notas" text,
	"concluido_em" timestamp with time zone,
	"concluido_por" integer,
	"criado_por" integer,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interacoes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "interacoes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cliente_id" integer NOT NULL,
	"negocio_id" integer,
	"canal" text NOT NULL,
	"resumo" text NOT NULL,
	"usuario_id" integer,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"usuario_id" integer,
	"usuario_nome" text,
	"acao" text NOT NULL,
	"entidade" text NOT NULL,
	"entidade_id" text,
	"descricao" text NOT NULL,
	"dados" jsonb,
	"origem" text DEFAULT 'sistema' NOT NULL,
	"ip" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mensagens" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mensagens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"conversa_id" integer NOT NULL,
	"direcao" text NOT NULL,
	"autor" text NOT NULL,
	"usuario_id" integer,
	"tipo" text DEFAULT 'texto' NOT NULL,
	"conteudo" text,
	"midia_url" text,
	"midia_nome" text,
	"midia_mime" text,
	"midia_tamanho" integer,
	"status" text NOT NULL,
	"externo_id" text,
	"resposta_a" bigint,
	"metadados" jsonb,
	"lida_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modelos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "modelos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tipo" text NOT NULL,
	"marca" text,
	"nome" text NOT NULL,
	"preco_tabela" numeric(12, 2),
	"eletrico" boolean DEFAULT true NOT NULL,
	"ficha" jsonb,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "negocio_eventos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "negocio_eventos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"negocio_id" integer NOT NULL,
	"tipo" text NOT NULL,
	"descricao" text NOT NULL,
	"dados" jsonb,
	"usuario_id" integer,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "negocios" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "negocios_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cliente_id" integer NOT NULL,
	"veiculo_id" integer,
	"veiculo_interesse" text,
	"responsavel_id" integer,
	"etapa" text DEFAULT 'whatsapp' NOT NULL,
	"origem" text,
	"valor_anunciado" numeric(12, 2),
	"valor_proposta" numeric(12, 2),
	"tem_troca" boolean DEFAULT false NOT NULL,
	"troca_descricao" text,
	"troca_valor" numeric(12, 2),
	"etapa_desde" timestamp with time zone DEFAULT now() NOT NULL,
	"ultima_interacao_em" timestamp with time zone,
	"triagem_ia" text,
	"atendimento_humano_id" integer,
	"perda_motivo" text,
	"perda_objecao" text,
	"perda_observacoes" text,
	"perdido_em" timestamp with time zone,
	"diagnostico_ia" jsonb,
	"diagnostico_em" timestamp with time zone,
	"diagnostico_modelo" text,
	"fechado_em" timestamp with time zone,
	"observacoes" text,
	"demo" boolean DEFAULT false NOT NULL,
	"criado_por" integer,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ordens_servico" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ordens_servico_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tipo" text NOT NULL,
	"cliente_id" integer NOT NULL,
	"veiculo_id" integer,
	"venda_id" integer,
	"veiculo_descricao" text NOT NULL,
	"placa" text,
	"chassi" text,
	"km" integer,
	"unidade_id" integer,
	"canal_recebimento" text NOT NULL,
	"status" text DEFAULT 'aberta' NOT NULL,
	"problema_relatado" text NOT NULL,
	"diagnostico_tecnico" text,
	"solucao_aplicada" text,
	"servicos_realizados" text,
	"observacoes" text,
	"resultado" text,
	"previsao_entrega" date,
	"aberta_por" integer,
	"recebida_por" integer,
	"tecnico_id" integer,
	"finalizada_por" integer,
	"entregue_por" integer,
	"aberta_em" timestamp with time zone DEFAULT now() NOT NULL,
	"recebida_em" timestamp with time zone,
	"finalizada_em" timestamp with time zone,
	"entregue_em" timestamp with time zone,
	"ia_assistencia" jsonb,
	"ia_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "os_eventos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "os_eventos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"os_id" integer NOT NULL,
	"tipo" text NOT NULL,
	"descricao" text NOT NULL,
	"de_status" text,
	"para_status" text,
	"dados" jsonb,
	"usuario_id" integer,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "os_itens" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "os_itens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"os_id" integer NOT NULL,
	"tipo" text NOT NULL,
	"descricao" text NOT NULL,
	"quantidade" numeric(10, 2) DEFAULT 1 NOT NULL,
	"valor_unitario" numeric(12, 2) DEFAULT 0 NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "respostas_rapidas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "respostas_rapidas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"atalho" text NOT NULL,
	"titulo" text NOT NULL,
	"conteudo" text NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "respostas_rapidas_atalho_unique" UNIQUE("atalho")
);
--> statement-breakpoint
CREATE TABLE "unidades" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "unidades_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nome" text NOT NULL,
	"cidade" text,
	"estado" text,
	"endereco" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unidades_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "usuarios_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nome" text NOT NULL,
	"usuario" text NOT NULL,
	"email" text,
	"senha_hash" text NOT NULL,
	"papel" text NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"sessao_versao" integer DEFAULT 1 NOT NULL,
	"ultimo_acesso_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_usuario_unique" UNIQUE("usuario")
);
--> statement-breakpoint
CREATE TABLE "veiculos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "veiculos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"modelo_id" integer,
	"tipo" text NOT NULL,
	"marca" text,
	"modelo" text NOT NULL,
	"versao" text,
	"cor" text,
	"ano_fabricacao" integer,
	"ano_modelo" integer,
	"placa" text,
	"chassi" text,
	"renavam" text,
	"km" integer,
	"condicao" text NOT NULL,
	"valor_anunciado" numeric(12, 2),
	"custo" numeric(12, 2),
	"status" text DEFAULT 'disponivel' NOT NULL,
	"unidade_id" integer,
	"origem_entrada" text,
	"observacoes" text,
	"entrada_em" date DEFAULT current_date NOT NULL,
	"vendido_em" timestamp with time zone,
	"criado_por" integer,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "venda_pagamentos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "venda_pagamentos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"venda_id" integer NOT NULL,
	"forma" text NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"entrada" boolean DEFAULT false NOT NULL,
	"instituicao" text,
	"observacao" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"negocio_id" integer,
	"cliente_id" integer NOT NULL,
	"veiculo_id" integer,
	"vendedor_id" integer,
	"valor_anunciado" numeric(12, 2),
	"valor_vendido" numeric(12, 2),
	"condicoes" text,
	"observacoes" text,
	"documentacao" jsonb,
	"status" text DEFAULT 'rascunho' NOT NULL,
	"documento_hash" text,
	"documento_gerado_em" timestamp with time zone,
	"documento_snapshot" jsonb,
	"assinatura_modo" text,
	"finalizada_em" timestamp with time zone,
	"finalizada_por" integer,
	"cancelada_em" timestamp with time zone,
	"cancelamento_motivo" text,
	"criado_por" integer,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_confirmado_por_usuarios_id_fk" FOREIGN KEY ("confirmado_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_criado_por_usuarios_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_responsavel_id_usuarios_id_fk" FOREIGN KEY ("responsavel_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_criado_por_usuarios_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuracoes" ADD CONSTRAINT "configuracoes_atualizado_por_usuarios_id_fk" FOREIGN KEY ("atualizado_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversa_notas" ADD CONSTRAINT "conversa_notas_conversa_id_conversas_id_fk" FOREIGN KEY ("conversa_id") REFERENCES "public"."conversas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversa_notas" ADD CONSTRAINT "conversa_notas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_responsavel_id_usuarios_id_fk" FOREIGN KEY ("responsavel_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_atendimento_humano_por_usuarios_id_fk" FOREIGN KEY ("atendimento_humano_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empresa" ADD CONSTRAINT "empresa_atualizado_por_usuarios_id_fk" FOREIGN KEY ("atualizado_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_conversa_id_conversas_id_fk" FOREIGN KEY ("conversa_id") REFERENCES "public"."conversas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_concluido_por_usuarios_id_fk" FOREIGN KEY ("concluido_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_criado_por_usuarios_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interacoes" ADD CONSTRAINT "interacoes_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interacoes" ADD CONSTRAINT "interacoes_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interacoes" ADD CONSTRAINT "interacoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logs" ADD CONSTRAINT "logs_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_conversa_id_conversas_id_fk" FOREIGN KEY ("conversa_id") REFERENCES "public"."conversas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negocio_eventos" ADD CONSTRAINT "negocio_eventos_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negocio_eventos" ADD CONSTRAINT "negocio_eventos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negocios" ADD CONSTRAINT "negocios_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negocios" ADD CONSTRAINT "negocios_veiculo_id_veiculos_id_fk" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negocios" ADD CONSTRAINT "negocios_responsavel_id_usuarios_id_fk" FOREIGN KEY ("responsavel_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negocios" ADD CONSTRAINT "negocios_atendimento_humano_id_usuarios_id_fk" FOREIGN KEY ("atendimento_humano_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negocios" ADD CONSTRAINT "negocios_criado_por_usuarios_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_veiculo_id_veiculos_id_fk" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_venda_id_vendas_id_fk" FOREIGN KEY ("venda_id") REFERENCES "public"."vendas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_unidade_id_unidades_id_fk" FOREIGN KEY ("unidade_id") REFERENCES "public"."unidades"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_aberta_por_usuarios_id_fk" FOREIGN KEY ("aberta_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_recebida_por_usuarios_id_fk" FOREIGN KEY ("recebida_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_tecnico_id_usuarios_id_fk" FOREIGN KEY ("tecnico_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_finalizada_por_usuarios_id_fk" FOREIGN KEY ("finalizada_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_entregue_por_usuarios_id_fk" FOREIGN KEY ("entregue_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "os_eventos" ADD CONSTRAINT "os_eventos_os_id_ordens_servico_id_fk" FOREIGN KEY ("os_id") REFERENCES "public"."ordens_servico"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "os_eventos" ADD CONSTRAINT "os_eventos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "os_itens" ADD CONSTRAINT "os_itens_os_id_ordens_servico_id_fk" FOREIGN KEY ("os_id") REFERENCES "public"."ordens_servico"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_modelo_id_modelos_id_fk" FOREIGN KEY ("modelo_id") REFERENCES "public"."modelos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_unidade_id_unidades_id_fk" FOREIGN KEY ("unidade_id") REFERENCES "public"."unidades"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_criado_por_usuarios_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venda_pagamentos" ADD CONSTRAINT "venda_pagamentos_venda_id_vendas_id_fk" FOREIGN KEY ("venda_id") REFERENCES "public"."vendas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_veiculo_id_veiculos_id_fk" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_vendedor_id_usuarios_id_fk" FOREIGN KEY ("vendedor_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_finalizada_por_usuarios_id_fk" FOREIGN KEY ("finalizada_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_criado_por_usuarios_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assinaturas_documento_idx" ON "assinaturas" USING btree ("documento_tipo","documento_id");--> statement-breakpoint
CREATE UNIQUE INDEX "clientes_cpf_unico" ON "clientes" USING btree ("cpf") WHERE "clientes"."cpf" is not null;--> statement-breakpoint
CREATE INDEX "clientes_nome_idx" ON "clientes" USING btree (lower("nome"));--> statement-breakpoint
CREATE INDEX "clientes_responsavel_idx" ON "clientes" USING btree ("responsavel_id");--> statement-breakpoint
CREATE INDEX "conversa_notas_conversa_idx" ON "conversa_notas" USING btree ("conversa_id","criado_em");--> statement-breakpoint
CREATE UNIQUE INDEX "conversas_contato_unico" ON "conversas" USING btree ("canal","contato_telefone");--> statement-breakpoint
CREATE INDEX "conversas_ultima_idx" ON "conversas" USING btree ("ultima_mensagem_em");--> statement-breakpoint
CREATE INDEX "conversas_responsavel_idx" ON "conversas" USING btree ("responsavel_id");--> statement-breakpoint
CREATE INDEX "conversas_cliente_idx" ON "conversas" USING btree ("cliente_id");--> statement-breakpoint
CREATE INDEX "follow_ups_agenda_idx" ON "follow_ups" USING btree ("status","agendado_para");--> statement-breakpoint
CREATE INDEX "follow_ups_conversa_idx" ON "follow_ups" USING btree ("conversa_id");--> statement-breakpoint
CREATE INDEX "interacoes_cliente_idx" ON "interacoes" USING btree ("cliente_id","criado_em");--> statement-breakpoint
CREATE INDEX "interacoes_negocio_idx" ON "interacoes" USING btree ("negocio_id");--> statement-breakpoint
CREATE INDEX "logs_criado_idx" ON "logs" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX "logs_entidade_idx" ON "logs" USING btree ("entidade","entidade_id");--> statement-breakpoint
CREATE INDEX "logs_usuario_idx" ON "logs" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "mensagens_conversa_idx" ON "mensagens" USING btree ("conversa_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "mensagens_externo_unico" ON "mensagens" USING btree ("externo_id") WHERE "mensagens"."externo_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "modelos_nome_unico" ON "modelos" USING btree ("nome");--> statement-breakpoint
CREATE INDEX "negocio_eventos_negocio_idx" ON "negocio_eventos" USING btree ("negocio_id","criado_em");--> statement-breakpoint
CREATE INDEX "negocios_etapa_idx" ON "negocios" USING btree ("etapa");--> statement-breakpoint
CREATE INDEX "negocios_cliente_idx" ON "negocios" USING btree ("cliente_id");--> statement-breakpoint
CREATE INDEX "negocios_responsavel_idx" ON "negocios" USING btree ("responsavel_id");--> statement-breakpoint
CREATE INDEX "negocios_criado_idx" ON "negocios" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX "os_status_idx" ON "ordens_servico" USING btree ("status");--> statement-breakpoint
CREATE INDEX "os_cliente_idx" ON "ordens_servico" USING btree ("cliente_id");--> statement-breakpoint
CREATE INDEX "os_aberta_idx" ON "ordens_servico" USING btree ("aberta_em");--> statement-breakpoint
CREATE INDEX "os_eventos_os_idx" ON "os_eventos" USING btree ("os_id","criado_em");--> statement-breakpoint
CREATE INDEX "os_itens_os_idx" ON "os_itens" USING btree ("os_id");--> statement-breakpoint
CREATE UNIQUE INDEX "veiculos_chassi_unico" ON "veiculos" USING btree ("chassi") WHERE "veiculos"."chassi" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "veiculos_placa_unica" ON "veiculos" USING btree ("placa") WHERE "veiculos"."placa" is not null;--> statement-breakpoint
CREATE INDEX "veiculos_status_idx" ON "veiculos" USING btree ("status");--> statement-breakpoint
CREATE INDEX "venda_pagamentos_venda_idx" ON "venda_pagamentos" USING btree ("venda_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vendas_negocio_unico" ON "vendas" USING btree ("negocio_id") WHERE "vendas"."negocio_id" is not null and "vendas"."status" <> 'cancelada';--> statement-breakpoint
CREATE INDEX "vendas_status_idx" ON "vendas" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vendas_finalizada_idx" ON "vendas" USING btree ("finalizada_em");--> statement-breakpoint
CREATE INDEX "vendas_cliente_idx" ON "vendas" USING btree ("cliente_id");
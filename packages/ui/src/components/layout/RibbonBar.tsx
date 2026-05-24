import React, { useState } from 'react'
import {
  Plus, Pencil, Trash2, RefreshCw, Download, Upload, Printer, FileText,
  Play, CheckSquare, Send, Umbrella, LogOut, Clock, BarChart2, Filter,
  Settings, Database, Shield, Users, Lock, Zap, Calculator, LayoutDashboard,
  Search, AlertCircle, CheckCircle, Link2,
} from 'lucide-react'

const TABS = [
  'Cadastros', 'Folha Mensal', 'Operações',
  'Relatórios', 'eSocial', 'Configurações', 'Gestão',
]

interface RibbonItem {
  icon: React.ElementType
  label: string
  onClick?: () => void
}
interface RibbonGroup {
  label: string
  items: RibbonItem[]
}

const RIBBON_CONTENT: Record<string, RibbonGroup[]> = {
  'Cadastros': [
    { label: 'ARQUIVO', items: [
      { icon: Plus,       label: 'Novo'     },
      { icon: Pencil,     label: 'Editar'   },
      { icon: Trash2,     label: 'Excluir'  },
    ]},
    { label: 'DADOS', items: [
      { icon: RefreshCw,  label: 'Atualizar' },
      { icon: Download,   label: 'Exportar'  },
      { icon: Upload,     label: 'Importar'  },
    ]},
    { label: 'IMPRESSÃO', items: [
      { icon: Printer,    label: 'Imprimir'  },
      { icon: FileText,   label: 'Preview'   },
    ]},
  ],
  'Folha Mensal': [
    { label: 'PROCESSAMENTO', items: [
      { icon: Play,         label: 'Calcular'   },
      { icon: CheckSquare,  label: 'Processar'  },
    ]},
    { label: 'DOCUMENTOS', items: [
      { icon: FileText,   label: 'Holerite'  },
      { icon: Download,   label: 'PDF'       },
    ]},
    { label: 'TRANSMISSÃO', items: [
      { icon: Send,       label: 'Publicar'  },
      { icon: Upload,     label: 'eSocial'   },
    ]},
  ],
  'Operações': [
    { label: 'COLABORADORES', items: [
      { icon: Umbrella,   label: 'Férias'    },
      { icon: LogOut,     label: 'Rescisão'  },
      { icon: Clock,      label: 'Ponto'     },
    ]},
    { label: 'RELATÓRIOS', items: [
      { icon: BarChart2,  label: 'Gráficos'  },
      { icon: Download,   label: 'Exportar'  },
    ]},
  ],
  'Relatórios': [
    { label: 'GERAR', items: [
      { icon: BarChart2,  label: 'Gerar'     },
      { icon: Filter,     label: 'Filtrar'   },
      { icon: Download,   label: 'Exportar'  },
    ]},
    { label: 'FORMATO', items: [
      { icon: FileText,   label: 'PDF'       },
      { icon: Download,   label: 'Excel'     },
    ]},
  ],
  'eSocial': [
    { label: 'EVENTOS', items: [
      { icon: Upload,       label: 'Transmitir'  },
      { icon: Search,       label: 'Consultar'   },
      { icon: RefreshCw,    label: 'Reprocessar' },
    ]},
    { label: 'MONITORAMENTO', items: [
      { icon: AlertCircle,  label: 'Alertas'     },
      { icon: CheckCircle,  label: 'Validados'   },
    ]},
  ],
  'Configurações': [
    { label: 'SISTEMA', items: [
      { icon: Settings,   label: 'Geral'       },
      { icon: Database,   label: 'Banco'       },
      { icon: Shield,     label: 'Segurança'   },
    ]},
    { label: 'USUÁRIOS', items: [
      { icon: Users,      label: 'Usuários'    },
      { icon: Lock,       label: 'Permissões'  },
    ]},
  ],
  'Gestão': [
    { label: 'FERRAMENTAS', items: [
      { icon: Zap,              label: 'QuickCalc'    },
      { icon: Calculator,       label: 'Simulador'    },
      { icon: LayoutDashboard,  label: 'Dashboard'    },
    ]},
    { label: 'INTEGRAÇÕES', items: [
      { icon: Link2,            label: 'Integrações'  },
    ]},
  ],
}

export default function RibbonBar() {
  const [activeTab, setActiveTab] = useState('Cadastros')
  const groups = RIBBON_CONTENT[activeTab] ?? []

  return (
    <div style={{ flexShrink: 0, background: 'var(--color-bg-ribbon)', borderBottom: '1px solid var(--color-border-main)' }}>

      {/* ── Tab strip ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        background: 'var(--color-bg-ribbon)',
        borderBottom: '1px solid var(--color-border-main)',
      }}>
        {TABS.map((tab) => {
          const active = tab === activeTab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                height: 24,
                padding: '0 14px',
                border: 'none',
                borderTop: active ? '2px solid var(--color-brand)' : '2px solid transparent',
                borderLeft: active ? '1px solid var(--color-border-main)' : '1px solid transparent',
                borderRight: active ? '1px solid var(--color-border-main)' : '1px solid transparent',
                borderBottom: active ? '1px solid var(--color-bg-white)' : 'none',
                background: active ? 'var(--color-bg-white)' : 'transparent',
                color: active ? 'var(--color-brand)' : 'var(--color-text-primary)',
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                position: 'relative',
                marginBottom: active ? -1 : 0,
              }}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* ── Toolbar content ────────────────────────────────────────── */}
      <div style={{
        background: 'var(--color-bg-white)',
        display: 'flex',
        alignItems: 'stretch',
        padding: '2px 6px',
        minHeight: 58,
        borderTop: '1px solid var(--color-border-main)',
      }}>
        {groups.map((group, gi) => (
          <React.Fragment key={group.label}>
            {gi > 0 && (
              <div style={{
                width: 1,
                background: 'var(--color-border-main)',
                margin: '4px 6px',
                flexShrink: 0,
              }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 2px' }}>
              {/* Button row */}
              <div style={{ display: 'flex', gap: 1, flex: 1, alignItems: 'flex-start', paddingTop: 3 }}>
                {group.items.map((item) => (
                  <RibbonButton key={item.label} icon={item.icon} label={item.label} onClick={item.onClick} />
                ))}
              </div>
              {/* Group label */}
              <div style={{
                fontSize: 10,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                borderTop: '1px solid var(--color-border-light)',
                width: '100%',
                textAlign: 'center',
                padding: '2px 4px 0',
                marginTop: 2,
                whiteSpace: 'nowrap',
              }}>
                {group.label}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function RibbonButton({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick?: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '3px 5px',
        border: `1px solid ${hover ? 'var(--color-border-main)' : 'transparent'}`,
        background: hover ? '#e8f0f8' : 'transparent',
        cursor: 'pointer',
        gap: 2,
        minWidth: 34,
      }}
    >
      <Icon size={24} style={{ color: 'var(--color-brand)', flexShrink: 0 }} />
      <span style={{
        fontSize: 10,
        color: 'var(--color-text-primary)',
        lineHeight: 1.1,
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </button>
  )
}

import { useState, useEffect } from 'react'
import type { Mount, Expansion, MountCategory, Faction, SourceType } from '../../../schemas/types'

interface MountFormProps {
  mount?: Mount
  onSave: (mount: Mount) => void
  onCancel: () => void
  existingIds: string[]
}

const expansions: Expansion[] = [
  "Classic",
  "The Burning Crusade", 
  "Wrath of the Lich King",
  "Cataclysm",
  "Mists of Pandaria"
]

const categories: MountCategory[] = ["Ground", "Flying", "Aquatic", "Multi"]
const factions: Faction[] = ["Alliance", "Horde", "Neutral"]
const sourceTypes: SourceType[] = ["Drop", "Vendor", "Quest", "Achievement", "Crafting", "Promotion", "Other"]

function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function MountForm({ mount, onSave, onCancel, existingIds }: MountFormProps) {
  const [formData, setFormData] = useState<Partial<Mount>>({
    id: '',
    name: '',
    expansion: 'Classic',
    category: 'Ground',
    faction: 'Neutral',
    sourceType: 'Drop',
    sourceDetail: '',
    dataVersion: 1,
    lastUpdatedUtc: new Date().toISOString(),
    ...mount
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!mount && formData.name) {
      const generatedId = generateId(formData.name)
      setFormData(prev => ({ ...prev, id: generatedId }))
    }
  }, [formData.name, mount])

  const handleChange = (field: keyof Mount, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      lastUpdatedUtc: new Date().toISOString()
    }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.id?.trim()) {
      newErrors.id = 'ID is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.id)) {
      newErrors.id = 'ID must contain only lowercase letters, numbers, and hyphens'
    } else if (!mount && existingIds.includes(formData.id)) {
      newErrors.id = 'ID already exists'
    }

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.sourceDetail?.trim()) {
      newErrors.sourceDetail = 'Source detail is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    const mountData: Mount = {
      id: formData.id!,
      name: formData.name!,
      expansion: formData.expansion!,
      category: formData.category!,
      faction: formData.faction!,
      sourceType: formData.sourceType!,
      sourceDetail: formData.sourceDetail!,
      zone: formData.zone || undefined,
      wowheadId: formData.wowheadId || undefined,
      requiresRiding: formData.requiresRiding || undefined,
      professionReq: formData.professionReq || undefined,
      reputationReq: formData.reputationReq || undefined,
      cost: formData.cost || undefined,
      isLimitedTime: formData.isLimitedTime || false,
      notes: formData.notes || undefined,
      tags: formData.tags || undefined,
      dataVersion: formData.dataVersion || 1,
      lastUpdatedUtc: new Date().toISOString()
    }

    onSave(mountData)
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', background: '#f9f9f9' }}>
      <h3>{mount ? 'Edit Mount' : 'New Mount'}</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label>
              ID *
              <input
                type="text"
                value={formData.id || ''}
                onChange={(e) => handleChange('id', e.target.value)}
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              />
              {errors.id && <div style={{ color: 'red', fontSize: '12px' }}>{errors.id}</div>}
            </label>
          </div>

          <div>
            <label>
              Name *
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              />
              {errors.name && <div style={{ color: 'red', fontSize: '12px' }}>{errors.name}</div>}
            </label>
          </div>

          <div>
            <label>
              Expansion *
              <select
                value={formData.expansion || ''}
                onChange={(e) => handleChange('expansion', e.target.value)}
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              >
                {expansions.map(exp => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label>
              Category *
              <select
                value={formData.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label>
              Faction *
              <select
                value={formData.faction || ''}
                onChange={(e) => handleChange('faction', e.target.value)}
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              >
                {factions.map(faction => (
                  <option key={faction} value={faction}>{faction}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label>
              Source Type *
              <select
                value={formData.sourceType || ''}
                onChange={(e) => handleChange('sourceType', e.target.value)}
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              >
                {sourceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div style={{ marginTop: '15px' }}>
          <label>
            Source Detail *
            <input
              type="text"
              value={formData.sourceDetail || ''}
              onChange={(e) => handleChange('sourceDetail', e.target.value)}
              style={{ width: '100%', padding: '5px', marginTop: '5px' }}
            />
            {errors.sourceDetail && <div style={{ color: 'red', fontSize: '12px' }}>{errors.sourceDetail}</div>}
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div>
            <label>
              Zone
              <input
                type="text"
                value={formData.zone || ''}
                onChange={(e) => handleChange('zone', e.target.value)}
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              />
            </label>
          </div>

          <div>
            <label>
              Wowhead ID
              <input
                type="number"
                value={formData.wowheadId || ''}
                onChange={(e) => handleChange('wowheadId', e.target.value ? parseInt(e.target.value) : undefined)}
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              />
            </label>
          </div>

          <div>
            <label>
              Cost
              <input
                type="text"
                value={formData.cost || ''}
                onChange={(e) => handleChange('cost', e.target.value)}
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              />
            </label>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={formData.isLimitedTime || false}
                onChange={(e) => handleChange('isLimitedTime', e.target.checked)}
              />
              Limited Time
            </label>
          </div>
        </div>

        <div style={{ marginTop: '15px' }}>
          <label>
            Notes
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '5px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '10px 20px' }}>
            {mount ? 'Update' : 'Create'} Mount
          </button>
          <button type="button" onClick={onCancel} style={{ background: '#f44336', color: 'white', border: 'none', padding: '10px 20px' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
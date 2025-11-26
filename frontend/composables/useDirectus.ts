import { createDirectus, rest, authentication, readMe, readItems, createItem, updateItem, deleteItem, uploadFiles } from '@directus/sdk'
import type { Project, User, TjmProfile } from '~/types'

// Schema Directus
interface DirectusSchema {
  projects: Project[]
  tjm_profiles: TjmProfile[]
  directus_users: User[]
}

export const useDirectus = () => {
  const config = useRuntimeConfig()
  
  const client = createDirectus<DirectusSchema>(config.public.directusUrl)
    .with(authentication('session', { credentials: 'include' }))
    .with(rest({ credentials: 'include' }))

  return {
    client,
    
    // Auth classique email/password
    async login(email: string, password: string) {
      try {
        await client.login(email, password)
        return { success: true }
      } catch (error: any) {
        console.error('Login error:', error)
        return { success: false, error: error.message || 'Erreur de connexion' }
      }
    },
    
    async logout() {
      try {
        await client.logout()
      } catch (error) {
        console.error('Logout error:', error)
      }
      navigateTo('/login')
    },
    
    async getCurrentUser(): Promise<User | null> {
      try {
        const user = await client.request(readMe({
          fields: ['id', 'email', 'first_name', 'last_name', 'avatar', 'role'],
        }))
        return user as User
      } catch (error) {
        return null
      }
    },
    
    // TJM Profiles
    async getTjmProfiles(): Promise<TjmProfile[]> {
      try {
        const profiles = await client.request(
          readItems('tjm_profiles', {
            sort: ['sort'],
            fields: ['*'],
          })
        )
        return profiles as TjmProfile[]
      } catch (error) {
        console.error('Error fetching TJM profiles:', error)
        return []
      }
    },
    
    // File Upload
    async uploadFile(file: File): Promise<{ id: string; filename: string } | null> {
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch(`${config.public.directusUrl}/files`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })
        
        if (!response.ok) {
          throw new Error('Upload failed')
        }
        
        const result = await response.json()
        return {
          id: result.data.id,
          filename: result.data.filename_download || result.data.title,
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        return null
      }
    },
    
    // Analyze Document with Claude
    async analyzeDocument(fileId: string, model: string = 'claude-sonnet-4-20250514'): Promise<any | null> {
      try {
        const response = await fetch(`${config.public.directusUrl}/analyze-document/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileId, model }),
          credentials: 'include',
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Analyse failed')
        }
        
        return await response.json()
      } catch (error: any) {
        console.error('Error analyzing document:', error)
        throw error
      }
    },
    
    // Chat with Claude
    async chatWithClaude(
      messages: Array<{ role: 'user' | 'assistant'; content: string }>,
      model: string = 'claude-sonnet-4-20250514',
      systemPrompt?: string
    ): Promise<any | null> {
      try {
        const response = await fetch(`${config.public.directusUrl}/analyze-document/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages, model, systemPrompt }),
          credentials: 'include',
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Chat failed')
        }
        
        return await response.json()
      } catch (error: any) {
        console.error('Error chatting with Claude:', error)
        throw error
      }
    },
    
    // Projects
    async getProjects(): Promise<Project[]> {
      try {
        const projects = await client.request(
          readItems('projects', {
            sort: ['-date_created'],
            fields: ['*'],
          })
        )
        return projects as Project[]
      } catch (error) {
        console.error('Error fetching projects:', error)
        return []
      }
    },
    
    async getProject(id: string): Promise<Project | null> {
      try {
        const projects = await client.request(
          readItems('projects', {
            filter: { id: { _eq: id } },
            fields: ['*'],
            limit: 1,
          })
        )
        return projects[0] as Project || null
      } catch (error) {
        console.error('Error fetching project:', error)
        return null
      }
    },
    
    async createProject(data: Partial<Project>): Promise<Project | null> {
      try {
        const project = await client.request(
          createItem('projects', data)
        )
        return project as Project
      } catch (error) {
        console.error('Error creating project:', error)
        return null
      }
    },
    
    async updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
      try {
        const project = await client.request(
          updateItem('projects', id, data)
        )
        return project as Project
      } catch (error) {
        console.error('Error updating project:', error)
        return null
      }
    },
    
    async deleteProject(id: string): Promise<boolean> {
      try {
        await client.request(deleteItem('projects', id))
        return true
      } catch (error) {
        console.error('Error deleting project:', error)
        return false
      }
    },
  }
}

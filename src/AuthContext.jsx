import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import bcrypt from 'bcryptjs'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // LocalStorage dan foydalanuvchini tekshirish
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      // Foydalanuvchini role bilan birga topish
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(name)
        `)
        .eq('username', username)
        .eq('is_active', true)
        .single()

      if (error || !users) {
        throw new Error('Foydalanuvchi topilmadi')
      }

      // Parolni tekshirish
      const isPasswordValid = await bcrypt.compare(password, users.password_hash)

      if (!isPasswordValid) {
        throw new Error('Parol noto\'g\'ri')
      }

      // Parolni o'chirish va role nomini qo'shish
      const { password_hash, role, ...userWithoutPassword } = users
      const userWithRole = {
        ...userWithoutPassword,
        role: role?.name || 'user'
      }

      setUser(userWithRole)
      localStorage.setItem('user', JSON.stringify(userWithRole))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const createUser = async (username, password, fullName, roleName, createdBy) => {
    try {
      // Parolni hashlash
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(password, salt)

      // Role ID ni olish
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single()

      if (roleError || !roleData) {
        throw new Error('Role topilmadi')
      }

      // Yangi foydalanuvchi yaratish
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            username,
            password_hash: passwordHash,
            full_name: fullName,
            role_id: roleData.id,
            created_by: createdBy
          }
        ])
        .select(`
          *,
          role:roles(name)
        `)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const canCreateUser = (currentUserRole, targetRole) => {
    if (currentUserRole === 'superadmin') return true
    if (currentUserRole === 'admin' && targetRole === 'user') return true
    return false
  }

  const canManageUsers = (currentUserRole) => {
    return currentUserRole === 'superadmin' || currentUserRole === 'admin'
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const updateProfile = async (updates) => {
    try {
      const updatedData = { ...updates }

      // Agar yangi parol bo'lsa, uni hashlash
      if (updates.newPassword) {
        const salt = await bcrypt.genSalt(10)
        updatedData.password_hash = await bcrypt.hash(updates.newPassword, salt)
        delete updatedData.newPassword
      }

      delete updatedData.currentPassword

      // Ma'lumotlarni yangilash
      const { data, error } = await supabase
        .from('users')
        .update(updatedData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      // Parolni o'chirish va saqlash
      const { password_hash, ...userWithoutPassword } = data
      setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    login,
    createUser,
    canCreateUser,
    canManageUsers,
    logout,
    updateProfile,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

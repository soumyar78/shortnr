class PasswordReset < ApplicationRecord
  belongs_to :user

  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  before_validation :generate_token, on: :create

  def active?
    used_at.nil? && expires_at > Time.current
  end

  def use!
    update!(used_at: Time.current)
  end

  private

  def generate_token
    return if token.present?
    
    loop do
      self.token = SecureRandom.urlsafe_base64(32)
      break unless PasswordReset.exists?(token: token)
    end
    self.expires_at ||= 2.hours.from_now
  end
end

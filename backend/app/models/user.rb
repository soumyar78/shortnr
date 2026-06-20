class User < ApplicationRecord
  has_secure_password

  has_many :short_links, dependent: :destroy
  has_one :bio_profile, dependent: :destroy

  generates_token_for :password_reset, expires_in: 15.minutes do
    password_salt&.last(10)
  end

  validates :name, presence: true
  validates :email, presence: true, 
                    uniqueness: { case_sensitive: false }, 
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, presence: true, length: { minimum: 6 }, allow_nil: true

  before_save :downcase_email
  after_create :create_default_bio_profile

  private

  def downcase_email
    self.email = email.downcase if email.present?
  end

  def create_default_bio_profile
    base_username = email.split('@').first.gsub(/[^a-zA-Z0-9_\-]/, '')
    base_username = "user" if base_username.blank?
    
    unique_username = base_username
    counter = 1
    while BioProfile.exists?(username: unique_username) || BioProfile::RESERVED_USERNAMES.include?(unique_username)
      unique_username = "#{base_username}#{counter}"
      counter += 1
    end

    create_bio_profile!(
      username: unique_username,
      bio: "Welcome to my Shortnr bio page!",
      avatar_url: nil
    )
  end
end


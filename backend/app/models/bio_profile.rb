class BioProfile < ApplicationRecord
  belongs_to :user
  has_many :bio_links, -> { order(position: :asc) }, dependent: :destroy

  RESERVED_USERNAMES = %w[api login signup dashboard settings bio profile logout help faq assets admin system support shortnr].freeze

  validates :username, presence: true,
                       uniqueness: { case_sensitive: false },
                       format: { with: /\A[a-zA-Z0-9_\-]+\z/, message: "can only contain letters, numbers, underscores, or hyphens" },
                       exclusion: { in: RESERVED_USERNAMES, message: "is a reserved username" }
  validates :bio, length: { maximum: 500 }, allow_blank: true
  validates :display_name, length: { maximum: 50 }, allow_blank: true

  before_save :downcase_username

  private

  def downcase_username
    self.username = username.downcase if username.present?
  end
end

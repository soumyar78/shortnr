class ShortLink < ApplicationRecord
  belongs_to :user, optional: true

  RESERVED_SLUGS = %w[api login signup dashboard settings bio profile logout help faq assets].freeze

  validates :original_url, presence: true, format: { with: /\Ahttps?:\/\/[\S]+/i, message: "must be a valid http or https URL" }
  validates :slug, presence: true, 
                   uniqueness: true, 
                   format: { with: /\A[a-zA-Z0-9_\-]+\z/, message: "can only contain alphanumeric characters, underscores, or hyphens" },
                   exclusion: { in: RESERVED_SLUGS, message: "is a reserved path" }

  before_validation :generate_slug, on: :create

  def increment_clicks!
    increment!(:click_count)
  end

  private

  def generate_slug
    return if slug.present?

    loop do
      self.slug = SecureRandom.alphanumeric(6).downcase
      break unless ShortLink.exists?(slug: slug) || RESERVED_SLUGS.include?(slug)
    end
  end
end

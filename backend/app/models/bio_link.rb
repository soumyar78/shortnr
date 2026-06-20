class BioLink < ApplicationRecord
  belongs_to :bio_profile

  validates :title, presence: true
  validates :url, presence: true, format: { with: /\Ahttps?:\/\/[\S]+/i, message: "must be a valid http or https URL" }
  validates :position, presence: true, numericality: { only_integer: true }

  before_validation :set_position, on: :create

  private

  def set_position
    return if position.present? && position != 0
    max_position = bio_profile&.bio_links&.maximum(:position) || -1
    self.position = max_position + 1
  end
end

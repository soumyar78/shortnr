require 'rails_helper'

RSpec.describe ShortLink, type: :model do
  it 'has a valid factory' do
    expect(build(:short_link)).to be_valid
  end

  describe 'validations' do
    it 'requires original_url' do
      expect(build(:short_link, original_url: nil)).not_to be_valid
    end

    it 'validates correct URL format' do
      invalid_link = build(:short_link, original_url: 'not-a-url')
      expect(invalid_link.valid?).to be false

      valid_link = build(:short_link, original_url: 'https://example.com')
      expect(valid_link.valid?).to be true
    end

    it 'validates slug format' do
      invalid_slug = build(:short_link, slug: 'invalid slug!')
      expect(invalid_slug.valid?).to be false

      valid_slug = build(:short_link, slug: 'valid_slug-123')
      expect(valid_slug.valid?).to be true
    end

    it 'excludes reserved slugs' do
      reserved_link = build(:short_link, slug: 'login')
      expect(reserved_link.valid?).to be false
    end
  end

  describe 'callbacks' do
    it 'generates a slug on create if not provided' do
      link = create(:short_link, slug: nil)
      expect(link.slug).to be_present
      expect(link.slug.length).to eq(6)
    end
  end

  describe '#increment_clicks!' do
    it 'increments the click_count by 1' do
      link = create(:short_link, click_count: 0)
      link.increment_clicks!
      expect(link.reload.click_count).to eq(1)
    end
  end
end

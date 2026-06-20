class AddDisplayNameToBioProfiles < ActiveRecord::Migration[8.0]
  def change
    add_column :bio_profiles, :display_name, :string
    change_column :bio_profiles, :avatar_url, :text
  end
end

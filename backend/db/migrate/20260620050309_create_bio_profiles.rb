class CreateBioProfiles < ActiveRecord::Migration[8.0]
  def change
    create_table :bio_profiles do |t|
      t.references :user, index: { unique: true }, null: false, foreign_key: true
      t.string :username, null: false
      t.text :bio
      t.string :avatar_url

      t.timestamps
    end
    add_index :bio_profiles, :username, unique: true
  end
end


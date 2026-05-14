package dto;

public class CustomerDTO {

	private String name;
	private String phone;

	// 생성자 추가
	public CustomerDTO(String name, String phone) {
		this.name = name;
		this.phone = phone;
	}

	public CustomerDTO() {

	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}
}
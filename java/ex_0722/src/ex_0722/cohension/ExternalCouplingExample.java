package ex_0722.cohension;

public class ExternalCouplingExample {

	static class ExternalConfig{
		public static final String API_PROTOCOL = "HTTPS/V1.2";
	}
	
	static class NetworkClient{
		public void connet() {
			System.out.println(ExternalConfig.API_PROTOCOL+"통신 규격으로 연결합니다.");
		}
	}
}

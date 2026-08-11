package ex_0722.cohension;

public class GameLuncher {

	public void launchGame() {
		showLodingScreen();
		loadingGameData();
		displayMainMap();
	}
	
	private void showLodingScreen() {
		System.out.println("1.로딩 화면을 표시합니다.");
	}
	
	private void loadingGameData() {
		System.out.println("2.캐릭터 데이터를 불러옵니다.");
	}
	
	private void displayMainMap() {
		System.out.println("3.메인 게임 화면을 출력합니다.");
	}
}

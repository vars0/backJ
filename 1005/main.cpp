#include <iostream>
#include <vector>

int main(int argc, char **argv)
{
  int T;
  std::cin >> T;
  for (int i = 0; i < T; i++)
  {
    int N, K;
    std::cin >> N >> K;
    int D[N];
    std::vector<std::vector<int>> rule;

    int rules[K][2];
    int time[N];
    for (int i = 0; i < N; ++i)
    {
      time[i] = -1;
    }
    int target;

    for (int j = 0; j < N; j++)
    {
      std::cin >> D[j];
    }
    for (int j = 0; j < K; j++)
    {
      std::vector<int> row;
      int a, b;
      std::cin >> a >> b;
      row.push_back(a - 1);
      row.push_back(b - 1);
      rule.push_back(row);
      // std::cin >> rules[j][0] >> rules[j][1];
      // rules[j][0]--;
      // rules[j][1]--;
      // vec[i][j]
    }
    std::cin >> target;
    target--;

    for (int j = 0; j < N; j++)
    {
      bool canBuild = true;
      for (int k = 0; k < K; k++)
      {
        if (rules[k][1] == j)
        {
          canBuild = false;
          break;
        }
      }
      if (canBuild)
      {
        time[j] = D[j];
      }
    }

    while (time[target] == -1)
    {
      for (int j = 0; j < N; j++)
      {
        if (time[j] != -1)
          continue;

        bool canBuild = true;
        for (int k = 0; k < K; k++)
        {
          if (rules[k][1] == j)
          {
            if (time[rules[k][0]] == -1)
            {
              canBuild = false;
              break;
            }
          }
        }
        if (canBuild)
        {
          for (int k = 0; k < K; k++)
          {
            if (rules[k][1] == j)
            {
              int M = time[rules[k][0]] + D[j];
              if (time[j] < M)
              {
                time[j] = M;
              }
            }
          }
        }
      }
    }
    std::cout << time[target] << std::endl;
  }
  return 0;
}